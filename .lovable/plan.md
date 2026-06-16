# Modo claro: fondo blanco real

El modo claro se ve gris porque tres capas lo oscurecen sobre el blanco:

1. El token `--background` es `220 36% 97%` (gris azulado, no blanco).
2. `--gradient-hero` añade radiales violeta/verde/azul sobre toda la página.
3. `AuroraCanvas` se pinta encima con `mix-blend-mode: multiply` y opacidad 0.55, que apaga cualquier blanco.

## Cambios

### 1. `src/index.css` — tokens de claro (bloque `html[data-theme="light"]` y variantes por modo)
- `--background: 0 0% 100%` (blanco puro). `--surface: 0 0% 100%`, `--surface-elevated: 0 0% 100%`.
- `--muted: 220 16% 96%`, `--border: 220 16% 90%`, `--input: 220 16% 92%` para mantener separación sutil sin tintar el fondo.
- `--gradient-hero` por modo: quitar el `linear-gradient` base coloreado y dejar `linear-gradient(180deg, #fff, #fff)` con radiales mucho más tenues (opacidad ≤ 0.08) en las esquinas, para que el fondo se perciba blanco con un halo muy leve del color del modo (home naranja, family violeta, travel azul).
- Ajustar `.glass-strong` y `.dock-glass` en claro a `hsl(0 0% 100% / 0.92)` con borde `hsl(220 16% 80% / 0.6)` para que las tarjetas sigan legibles sobre blanco puro.

### 2. `src/components/Motion/AuroraCanvas.tsx` — overlay en claro
- En `applyTheme()` rama `light`: `canvas.style.opacity = "0.22"`, `mixBlendMode = "screen"` (en lugar de `multiply`, que oscurece sobre blanco), `uMix = 0.12`, `uBg = (1.0, 1.0, 1.0)`. Así la aurora aporta solo un tinte de color sin grisar el blanco.
- Mantener rama `dark` sin cambios.

### Fuera de alcance
- Tokens del modo oscuro, paleta aurora, lógica de `useTheme`, layout o componentes.
