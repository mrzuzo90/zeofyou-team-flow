# Premium pass — Misiones, Focus, Identidades, Insights, Perfil + Sidebar

Continuación del plan de diseño "Award-grade". Aplico los primitives de motion ya construidos (`KineticHeading`, `AnimatedNumber`, `MagneticButton`, `TiltCard`) a las cinco pantallas restantes, refino el `AppSidebar` con indicador animado y hago QA visual de las transiciones de página. No toco lógica de datos ni de negocio.

## 1. Misiones (`src/pages/Missions.tsx`)
- Cabeceras de sección (Primaria, Secundarias, Trabajadas hoy…) con `KineticHeading splitBy="word"` y entrada en stagger.
- KPIs de la cabecera (XP del día, racha, completadas) con `AnimatedNumber`.
- Tarjeta de misión envuelta en `TiltCard` (max 6° en desktop, desactivado en touch/reduced-motion).
- Botones de acción primarios (Completar, Empezar) con `MagneticButton` + glow sutil al hover.
- Barra de progreso de misión: añadir capa shimmer aurora encima de la barra existente.

## 2. Focus (`src/pages/Focus.tsx`)
- `KineticHeading` para el título (nombre de identidad) con `splitBy="char"`.
- Contador del Pomodoro como `AnimatedNumber` (segundos y minutos, fade entre cambios).
- Botones Start/Pause/Stop como `MagneticButton`; el botón principal con "breathing glow" (animación lenta sobre `box-shadow` aurora) durante la sesión activa.
- Tarjeta del objetivo de sesión con `TiltCard` ligero.

## 3. Identidades (`src/pages/Identities.tsx`)
- Título de página con `KineticHeading`.
- Cada tarjeta de identidad envuelta en `TiltCard` y con `MagneticButton` para la acción primaria.
- Métricas por identidad (energía, misiones, XP) con `AnimatedNumber`.
- Reveal con stagger al montar la grilla.

## 4. Insights (`src/pages/Insights.tsx`)
- Título con `KineticHeading`.
- Big numbers del resumen (XP semanal, % de cumplimiento, racha) con `AnimatedNumber` y eyebrow mono.
- Pequeños sparklines/heatmap: aplicar `TiltCard` al contenedor principal de la tarjeta (sin tocar la lógica del gráfico).
- Filtros (chips de semana/mes) como `MagneticButton`.

## 5. Perfil (`src/pages/Profile.tsx`)
- `KineticHeading` en cabecera.
- XP, nivel, racha y misiones completadas con `AnimatedNumber`.
- "Guardar", "Cerrar sesión" como `MagneticButton`.
- La tarjeta de identidad del usuario envuelta en `TiltCard`.

## 6. Sidebar desktop (`src/components/Layout/AppSidebar.tsx`)
- Indicador activo animado tipo "liquid": una franja `layoutId="sidebar-active"` (Framer Motion) que se desliza entre items con `spring`.
- Halo aurora sutil detrás del item activo, sincronizado con el modo de contexto (usa los tokens existentes `--primary` / `--gradient-aurora`).
- Hover con sombra elevada y pequeño desplazamiento; iconos con micro-bounce.
- Colapsado (icon-only) mantiene el indicador como punto luminoso lateral.

## 7. QA visual de transiciones de página
- Verificar que `PageTransition` no produce flash blanco al cambiar de ruta en tema claro y oscuro.
- Asegurar que el "curtain" respeta el gradiente del modo actual (work/home/family/travel) y no se queda visible si la ruta cambia rápido.
- Revisar que `KineticHeading` no re-anima en cada `setState` (key estable por ruta+título).
- Capturas en desktop 1440 y móvil 390 para Dashboard, Misiones, Focus, Identidades, Insights, Perfil — claro y oscuro.

## Accesibilidad y rendimiento
- Todos los efectos pesados envueltos en `useReducedMotion()` y desactivados en touch (`window.matchMedia('(hover: none)')`).
- `TiltCard` solo activo con puntero fino; degrada a card normal en táctil.
- No se introduce ninguna dependencia nueva.

## Fuera de alcance
- Lógica de negocio, datos, RLS, edge functions.
- Nuevos colores o tipografías (se usan los tokens y fuentes ya definidos).
- Onboarding, Login, Signup, Planning, HandsFree, Transition.
