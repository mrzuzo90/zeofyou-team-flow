## Roadmap (4 fases)

Implementaré las 8 mejoras en 4 fases que se pueden ir validando una a una. Te aviso al terminar cada fase y seguimos. Si en algún momento quieres saltar/parar, lo dices.

---

### Fase 1 — Desconexión y reglas por modo

**Reglas de desconexión** activas según el modo:
- `home` / `family`: oculta tarjetas de misiones laborales (ya tenían filtro, ahora añadimos un **banner amable** si intentas ir a Misiones de Trabajo: "Ahora estás en modo Familia. ¿Seguro que quieres mirar el trabajo?").
- `work`: oculta misiones personales y silencia los toasts no críticos.
- Bloqueo opcional del Focus Timer si la misión que vas a empezar es de otro contexto (con override).

**Historial de modos** (nueva tabla `mode_sessions`: user_id, mode, started_at, ended_at). Cada cambio en `current_mode` cierra la sesión anterior y abre una nueva. Vista compacta en `/perfil` con barra de % de tiempo en cada modo (últimos 7 días).

Archivos: migración + `useModeHistory.ts` + `<ModeUsageBar />` en Perfil + lógica en `useCurrentMode` para registrar transiciones + guard de contexto en `ModeGuard.tsx`.

---

### Fase 2 — Ritual de transición + Check-in de energía

**Ritual de transición** (`/transicion?from=work&to=home`): pantalla full-screen 30-45s con 3 pasos animados:
1. Respiración guiada (4-7-8, círculo que escala con framer-motion, 3 ciclos)
2. "Qué dejas atrás" — input de 1 línea (se guarda como nota)
3. "Qué traes al nuevo modo" — input de 1 línea + botón "Estoy aquí"

Se dispara automáticamente al cambiar de modo desde el `ModeSwitcher` (toggle "Hacer ritual" en preferencias, default ON).

**Check-in de energía** (2×/día, 9-10h y 17-18h): mini-modal con escala 1-5 + emoji + opción de campo libre. Persiste en nueva tabla `energy_checkins`. La energía media del último check-in influye en la **dificultad sugerida** del widget de 2-min de la fase 3.

Archivos: `/pages/Transition.tsx`, `EnergyCheckIn.tsx`, hook `useEnergyCheckIn`, migración (`energy_checkins`, `transition_notes`).

---

### Fase 3 — Brain dump + Widget "siguiente acción de 2 min"

**Brain dump flotante**: botón redondo siempre visible (esquina inferior derecha, encima del BottomNav). Abre un `Drawer` con textarea grande "Suelta lo que tengas en la cabeza". Al enviar, una edge function `brain-dump-classify` (Gemini Flash) clasifica cada línea en: `mission` (sugerida, no creada), `idea`, `worry`, `note`. Se muestran chips para aprobar/descartar antes de guardar. Las aprobadas como misión heredan el `context` actual.

**Widget 2-min** en Dashboard: tarjeta con una micro-acción contextualizada al modo + última energía. Heurística cliente sin IA para arrancar: lista por modo + nivel de energía (alta=acción de ejecución, baja=acción de orden/limpieza). Botón "Hecho" da +5 XP y carga otra.

Archivos: `BrainDumpButton.tsx`, edge function `brain-dump-classify`, `TwoMinWidget.tsx`, librería `lib/micro-actions.ts`, tabla `brain_dumps`.

---

### Fase 4 — Modo coche + Resumen semanal

**Modo coche / manos libres** (`/manos-libres`): ruta dedicada, tipografía XXL, fondo oscuro alto contraste, una sola misión principal a la vista, botón gigante "Empezar Focus" (45 min por defecto). Accesible desde el `ModeSwitcher` con un botón secundario "Manos libres" y como atajo en la home cuando `mode === "travel"`.

**Resumen semanal in-app** en `/insights`:
- Edge function `weekly-summary` con Gemini: recibe XP de la semana, misiones completadas/abiertas, energía media por identidad, % tiempo por modo y devuelve un texto motivador + 3 sugerencias para la próxima semana.
- Se genera bajo demanda (botón "Generar resumen semanal") y se cachea por semana ISO en tabla `weekly_summaries`.
- Vista nueva con métricas + el texto de la IA. (Email queda pendiente, fuera de scope inicial para no requerir setup de dominio).

Archivos: `/pages/HandsFree.tsx`, ajuste de `App.tsx`, edge function `weekly-summary`, tabla `weekly_summaries`, sección "Resumen semanal" en Insights.

---

## Detalles técnicos comunes

- Las edge functions usan Lovable AI Gateway + `google/gemini-3-flash-preview` con parsing JSON manual (mismo patrón que `onboarding-suggest`).
- Todas las tablas nuevas: RLS por `auth.uid()`, GRANTs a `authenticated` y `service_role`.
- Sin librerías nuevas: framer-motion y shadcn ya cubren todo.
- Ningún cambio rompe la UI actual: cada feature es aditiva y se puede ocultar con un flag de preferencias si molesta.

## Fuera de scope (lo dejamos para después si lo pides)

- Envío del resumen semanal por email (necesita configurar dominio).
- Notificaciones push reales.
- Bloqueo de webs/apps externas (la web no puede).
- Reconocimiento de voz en modo coche (sumar después si quieres).
