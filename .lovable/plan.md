# Zeofyou · Premium Award Pass

Objetivo: llevar la app del nivel actual ("Aurora con halo") a una pieza candidata a Awwwards. Inspiración: **Active Theory, Resn, ILoveDust** — motion fuerte, materialidad de luz, cursor propio, transiciones de página, tipografía cinética. Se aplica a toda la app y se mantiene compatible con móvil (los efectos pesados degradan elegantemente y respetan `prefers-reduced-motion`).

---

## 1 · Fundamentos de motion y materialidad

**Lenis (scroll suave global)** envuelto en provider con fallback a scroll nativo en móvil.

**Cursor custom magnético**
- Punto + halo aurora que sigue al ratón con lerp.
- Pasa a estado "magnet" al hover sobre `[data-magnetic]` (botones, tarjetas de identidad, CTA hero) — el botón se desplaza ligeramente hacia el cursor.
- Cambia a "view"/"focus"/"play" según el contexto (data attr).
- Oculto en touch / `prefers-reduced-motion`.

**Aurora WebGL real (sustituye los blobs CSS)**
- `@react-three/fiber` + shader fragment con noise simplex de baja frecuencia, paleta `#a78bfa → #4ade80 → #3b82f6` derivada de tokens.
- Reacciona al scroll (intensidad), al modo (paleta) y a la posición del cursor (centro de luz).
- En móvil cae a un canvas 2D ligero o a los blobs CSS actuales.

**Page transitions tipo "curtain"**
- Overlay aurora con clip-path animado: barrido diagonal al cambiar de ruta.
- Durante el wipe, el título de la nueva página entra con SplitText carácter a carácter.
- Integrado en `App.tsx` con `AnimatePresence mode="wait"` y wrapper de ruta.

**SplitText kinético**
- Componente `<KineticHeading>` que rompe el título en chars/words y los anima en stagger (mask reveal + Y).
- Se usa en TopBar (título de página) y en los hero de cada pantalla.

**Microinteracciones globales**
- Botones con press spring + glow pulse al activarse.
- Tarjetas con tilt 3D (perspective + rotateX/Y según mouse).
- Counters (`AnimatedNumber`) para energía, focus min, XP, racha.
- Hover state con borde aurora animado (conic-gradient rotando).

---

## 2 · Shell (TopBar, Dock, Sidebar, Loader)

**Intro/Loader (solo primera carga)**
- Pantalla negra → palabra "ZEOFYOU" se ensambla letra a letra desde aurora → barrido aurora → contenido aparece.
- Se omite tras la primera visita (localStorage) y para `prefers-reduced-motion`.

**TopBar**
- Eyebrow + título con KineticHeading.
- Línea aurora animada bajo el header (degradado en bucle 8 s) en lugar del border-bottom.
- Botones circulares con halo magnético en hover.
- Avatar con anillo gradiente que rota lentamente cuando hay racha activa.

**Dock móvil (BottomNav)**
- "Liquid indicator": pill aurora que se desplaza con spring al cambiar de tab (`layoutId`).
- FAB central con halo respirando + microparticles de luz al pulsar.
- En tablet/desktop, el dock se transforma en barra flotante centrada arriba.

**Sidebar desktop**
- Glass denso con reveal animado de iconos al colapsar.
- Indicador activo con barra aurora vertical de altura animada.

---

## 3 · Pantallas

**Dashboard**
- Hero misión principal: número/icono gigante, halo aurora respirando, CTA con cursor magnético y partículas al hover.
- KPIs bento con counters animados y mini-anillos que se rellenan en mount.
- Tarjetas de identidad con tilt 3D, gradiente per-identidad y anillo de energía animado al scroll (IntersectionObserver).
- Sección "Tu equipo" con marquee sutil de roles disponibles en el fondo.

**Misiones**
- Header editorial: número total como display gigante (Fraunces / Migra), subtítulo pequeño.
- Cards de misión en grid masonry; barra de progreso con shimmer aurora y porcentaje con counter.
- Filtros como pills con liquid indicator.
- Drag-to-reorder con spring.
- Empty state ilustrado (SVG aurora animado) con CTA magnético.

**Focus**
- Pomodoro central con dial circular SVG enorme; el anillo se "consume" con stroke-dashoffset y el centro emite glow aurora pulsante sincronizado al respirar (4 s in / 6 s out).
- Background WebGL más intenso durante sesión activa.
- Al completar: confetti + barrido aurora + sonido suave (toggle).
- Identidad asociada flotando arriba con avatar tilt.

**Identidades**
- Grid tipo "showcase" con cada identidad como pieza editorial: avatar enorme, nombre serif gigante, rol en mono pequeño.
- Hover: tarjeta se eleva, gradiente per-identidad invade el fondo brevemente.
- Click: transición morph al detalle (FLIP con `layoutId`).

**Insights**
- Heatmap de focus rediseñado con cell hover magnético y tooltip flotante.
- Cards de estadística con counters + sparkline animado al entrar en viewport.
- Sección de correlaciones con tipografía editorial grande.

**Perfil**
- Hero con avatar gradiente rotando + datos en grid editorial.
- XP bar como anillo aurora animado.
- Lista de achievements con stagger reveal y badge tilt.

---

## 4 · Tipografía y tokens

- Mantener **Sora + Manrope** y añadir **Fraunces** (display serif variable) para gestos editoriales (números grandes, eyebrows, hero serif). Cargada desde Google Fonts.
- Añadir tokens: `--ease-aurora`, `--shadow-magnet`, `--gradient-aurora-radial`, `--cursor-size`.
- Nuevas utilidades: `magnetic`, `kinetic`, `aurora-border`, `tilt-card`.

---

## 5 · Accesibilidad y rendimiento

- `prefers-reduced-motion`: desactiva cursor custom, WebGL, page wipes, splittext stagger; deja fades suaves.
- WebGL aurora con `dpr=[1, 1.5]` y pausa cuando la pestaña no es visible.
- Touch: cursor oculto, tilt desactivado, transiciones más cortas.
- Lazy: Lenis, R3F y cursor se cargan en `Suspense` tras hidratación.

---

## 6 · Detalles técnicos (sección para devs)

**Dependencias nuevas**
- `lenis` (smooth scroll)
- `three` + `@react-three/fiber` (aurora WebGL)
- `split-type` o implementación propia ligera para SplitText
- Reutilizamos `framer-motion` (ya instalado) para `AnimatePresence`, `layoutId`, springs.

**Archivos nuevos**
- `src/components/Motion/SmoothScroll.tsx` — provider Lenis.
- `src/components/Motion/CustomCursor.tsx` — cursor + estados.
- `src/components/Motion/PageTransition.tsx` — wipe aurora entre rutas.
- `src/components/Motion/KineticHeading.tsx` — split text reutilizable.
- `src/components/Motion/AnimatedNumber.tsx` — counter spring.
- `src/components/Motion/TiltCard.tsx` — wrapper 3D tilt.
- `src/components/Motion/MagneticButton.tsx` — wrapper magnético.
- `src/components/Motion/AuroraCanvas.tsx` — shader R3F.
- `src/components/Motion/IntroLoader.tsx` — splash inicial.
- `src/hooks/useReducedMotion.ts` + `useMagnetic.ts`.

**Archivos editados**
- `src/App.tsx` — `SmoothScroll`, `CustomCursor`, `IntroLoader`, ruta envuelta en `PageTransition`.
- `src/components/Layout/Layout.tsx` — `AuroraCanvas` sustituye `aurora-bg`.
- `src/components/Layout/TopBar.tsx` — KineticHeading + línea aurora.
- `src/components/Layout/BottomNav.tsx` — liquid indicator con `layoutId`.
- `src/components/Layout/AppSidebar.tsx` — indicador animado.
- `src/index.css` + `tailwind.config.ts` — tokens y utilidades nuevas, Fraunces.
- Páginas: `Dashboard`, `Missions`, `Focus`, `Identities`, `Insights`, `Profile` — aplicar KineticHeading, AnimatedNumber, TiltCard, MagneticButton donde toca.

**Fuera de alcance**
- Sonidos (solo el "tick" del Pomodoro opcional, sin biblioteca de sound design).
- Login/Onboarding/Signup (se queda como está; afectaría flujo y testing).
- Cambios de copy o lógica de negocio.
