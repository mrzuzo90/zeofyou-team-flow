
# Rediseño integral de Zeofyou

Mantenemos el concepto (equipo mental interno) y la estructura de páginas, pero rehago diseño, UX y funcionalidad. Activamos Lovable Cloud para cuentas reales, datos sincronizados e IA para recomendaciones.

## 1. Sistema de diseño (base)

Nueva identidad visual cálida y premium, no corporativa:

- **Paleta** (tokens HSL en `index.css`):
  - `--background` azul marino profundo (`222 47% 7%`)
  - `--card` azul marino translúcido para glassmorphism
  - `--primary` verde esmeralda (`160 84% 45%`)
  - `--accent` azul brillante secundario (`210 90% 60%`)
  - Gradientes: `--gradient-hero`, `--gradient-card`, `--gradient-emerald`
  - Sombras: `--shadow-glass`, `--shadow-glow-emerald`
- **Tipografía**: par `sora-manrope` (headlines Sora, cuerpo Manrope) cargado desde Google Fonts en `index.html`.
- **Glassmorphism**: utilidad `.glass-card` (`backdrop-blur`, borde sutil, fondo semi-transparente sobre gradiente de fondo).
- **Animaciones** Tailwind + Framer Motion (`framer-motion`): `fade-in`, `slide-up`, transiciones de página, hover-scale en cards, micro-interacciones en botones.
- Refactor de todos los componentes para usar tokens semánticos — eliminar `text-white`, `bg-gray-800`, etc.

## 2. Backend (Lovable Cloud)

Activar Cloud y crear el esquema:

- **Auth**: email/password + Google.
- **Tabla `profiles`** (FK a `auth.users`, trigger autocreación): `display_name`, `avatar_url`, `level`, `xp`, `streak_days`, `last_active_at`, `preferences jsonb`.
- **Tabla `identities`**: `user_id`, `name`, `role`, `color`, `avatar`, `description`, `energy` (0-100), `specialty`, `status` (`active`/`resting`/`paused`).
- **Tabla `missions`**: `user_id`, `title`, `description`, `is_primary boolean`, `assigned_identity_id`, `status`, `priority`, `due_date`, `xp_reward`, `category`.
- **Tabla `focus_sessions`**: `user_id`, `identity_id`, `mission_id`, `duration_minutes`, `completed_at`, `pomodoros_completed`.
- **Tabla `achievements`**: catálogo + `user_achievements` con `unlocked_at`.
- **Tabla `daily_metrics`**: snapshot diario (energía media, foco, misiones completadas, identidad más usada) para insights y entrenar las recomendaciones.
- RLS en todas las tablas: `auth.uid() = user_id`. GRANTs explícitos (`authenticated`, `service_role`).
- **Seed**: al crear perfil, insertar 4 identidades por defecto (Estratega, Creativo, Organizador, Coach) y 3 misiones de ejemplo.

## 3. Páginas y UX

Estructura de rutas se mantiene; rediseño total del contenido.

### Onboarding (`/bienvenida`, primera sesión)
Wizard de 4 pasos con animaciones: explicación del concepto → elegir/personalizar identidades iniciales → elegir misión principal → tour visual de la app.

### Dashboard (`/`)
- Hero con saludo + nivel/XP + racha.
- Barra de "energía del equipo" animada.
- Card destacada: **Misión Principal** activa con CTA "Entrar en Focus".
- Carrusel horizontal de identidades con estado en tiempo real (avatar, anillo de energía).
- Sección **Recomendaciones del día** (IA, ver §5).
- Timeline visual minimalista (sin listas largas de texto).
- Alerta sutil de **Conflicto** si hay >3 identidades activas a la vez.

### Identidades (`/identidades`)
- Grid responsive (1/2/3 col) con tarjetas glass.
- Cada tarjeta: avatar, rol, nivel de energía (barra), especialidad, toggle activo/descansando/pausado, botón "Convocar a Focus".
- Modal con detalles + historial de sesiones de esa identidad.
- Botón "Crear identidad" con asistente.

### Misiones (`/proyectos` → "Misiones")
- Vista Kanban en desktop, lista en mobile.
- **Misión principal** destacada arriba; al activarla, las secundarias se ven bloqueadas (opacidad + candado + tooltip "Termina o pausa la misión principal").
- Cada misión muestra identidad asignada, prioridad, XP que otorga.

### Focus (`/enfoque`)
- Selector de identidad activa (la del equipo seleccionado).
- **Pomodoro** circular con sesión/descanso configurables; al terminar guarda `focus_session`, suma XP a perfil e identidad, y propone descanso.
- Modo pantalla completa.
- Botón flotante discreto **"Pausa privada"** (anti-intrusos) en esquina inferior: un toque cambia toda la pantalla a un widget neutro (hora grande, clima dummy, sin branding Zeofyou). Otro toque (o gesto largo) devuelve a la app.

### Planificación (`/planificacion`)
- Calendario semanal con bloques arrastrables (mocked, sin DnD complejo): mañana/tarde/noche × días, cada bloque asignado a una identidad.
- Vista "Equilibrio de la semana" mostrando reparto por identidad.

### Insights (`/insights`)
- Gráficas (Recharts): energía diaria, productividad, balance de identidades (radar), tiempo en focus.
- **Resumen semanal generado por IA** (Lovable AI Gateway, ver §5).
- Logros desbloqueados / siguientes objetivos.

### Perfil (`/perfil`)
- Datos del usuario, nivel y barra de XP grande, racha, logros con visuales de rareza (común/raro/épico).
- Preferencias: duración Pomodoro por defecto, identidades favoritas, tema, gesto anti-intrusos.
- Logout.

## 4. Nuevas funcionalidades

- **Misión principal con bloqueo inteligente**: hook `useMissions` que expone `primaryMission` y bloquea cambios de estado en secundarias mientras esté activa.
- **Pomodoro por identidad**: el timer guarda `identity_id`; sumar XP a la identidad usada.
- **Anti-intrusos**: componente `PrivacyShield` montado en `Layout` con contexto global y atajo (botón flotante + tecla `Esc` larga).
- **Detector de conflictos**: util que mira identidades activas; si > umbral configurable, muestra banner sugiriendo poner alguna en "descansando".
- **XP / niveles / logros**: helper `levelFromXp`, tabla `achievements` con catálogo seed (primer focus, 7 días seguidos, 10 misiones, etc.), toast al desbloquear.
- **Persistencia robusta**: además de la DB, capa `useLocalCache` que sincroniza al volver online (fallback offline).

## 5. IA (Lovable AI Gateway)

Edge Functions en `supabase/functions/`:

- `daily-recommendations`: input = últimos 14 días de `daily_metrics` + identidades + misiones activas; output JSON estructurado (3 sugerencias: identidad a activar, misión a priorizar, hábito de descanso). Modelo `google/gemini-3-flash-preview` con `Output.object` (Zod). Cache 1× por día por usuario.
- `weekly-insights`: input = métricas de la semana; output narrativa corta + 2 áreas de mejora.

Sin streaming, llamadas one-shot. Usar el helper `ai-gateway` compartido. `LOVABLE_API_KEY` auto-provisionado.

## 6. Componentes reutilizables (nuevos)

- `GlassCard`, `GradientBackground`, `EnergyRing`, `XPBar`, `LevelBadge`, `IdentityAvatar`, `PomodoroTimer`, `PrivacyShield`, `ConflictBanner`, `AchievementToast`, `MissionCard`, `PageTransition` (wrapper Framer Motion).

## 7. Navegación

- **Desktop**: sidebar colapsable shadcn con iconos + labels, branding arriba, perfil/logout abajo.
- **Mobile**: bottom nav rediseñada con 5 entradas (Inicio, Identidades, Focus —botón central destacado—, Misiones, Insights). Perfil accesible desde header.
- Header con avatar, racha y XP visible siempre.

## 8. Detalles técnicos

- React + Vite + Tailwind (sin cambios).
- Añadir dependencia `framer-motion`.
- Recharts ya disponible para gráficas.
- Refactor de `AppContext` → hooks específicos (`useIdentities`, `useMissions`, `useFocus`, `useProfile`) que consumen Supabase con React Query.
- Eliminar la simulación de login en localStorage; usar `supabase.auth` con listener `onAuthStateChange` correcto y `getUser()` para checks sensibles.
- Rutas protegidas con redirección a `/login`.
- Renombrar `_old` y limpiar imports inconsistentes.

## 9. Entregable

Aplicación 100% en español, responsive de verdad (mobile-first pero excelente en desktop), con datos reales por usuario, IA funcionando para recomendaciones e insights, modo anti-intrusos, sistema de misiones con bloqueo, Pomodoro integrado y XP/logros visibles.

El trabajo se entregará en orden: tokens & layout → auth & schema → identidades → misiones → focus + anti-intrusos → insights + IA → onboarding y pulido.
