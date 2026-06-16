# Fix: modo claro realmente claro

El `AuroraCanvas` (WebGL) ocupa toda la pantalla como fondo y tiene **el color base hardcoded en el shader**:

```glsl
vec3 bg = vec3(0.06, 0.065, 0.10);  // casi negro
col = mix(bg, col, 0.55);
```

Eso pinta un fondo casi negro sobre todo el `body`, así que aunque los tokens del tema claro estén bien, el lienzo aurora los tapa. Por eso el "modo claro" sigue viéndose oscuro.

## Cambios

1. **`src/components/Motion/AuroraCanvas.tsx`**
   - Añadir un uniform `uBg` (vec3) y un uniform `uMix` (float) al shader, en lugar del color fijo.
   - Leer el tema actual con `document.documentElement.dataset.theme` y un `MutationObserver` sobre `<html>` para actualizar uniforms al cambiar tema/modo sin recrear el contexto WebGL.
   - Tema oscuro: `bg = (0.06, 0.065, 0.10)`, `mix = 0.55`, opacidad canvas `0.9` (como ahora).
   - Tema claro: `bg = (0.97, 0.97, 0.99)`, `mix = 0.18` (aurora muy diluida), opacidad canvas `0.55` y `mix-blend-mode: multiply` para que tiña suave sin oscurecer.
   - En `prefers-reduced-motion` (fallback CSS `.aurora-bg`): asegurar que también respeta tema claro (los overrides ya añadidos en `index.css` lo cubren, no toco nada).

2. **`src/index.css`**
   - Subir luminosidad del `--gradient-hero` claro y añadir un `--shadow-glass` con menos opacidad para que el glassmorphism sobre fondo claro no se vea sucio.
   - Asegurar `body { background-color: hsl(var(--background)); }` explícito (ya está vía `bg-background`, pero confirmo).
   - Pequeño retoque a `.glass-card` en claro: borde y sombras más sutiles para que las tarjetas no parezcan "agujeros" sobre fondo blanco.

## Fuera de alcance
- No cambio la paleta aurora ni los tokens del tema oscuro.
- No toco lógica de aplicación de tema (`useTheme`), que ya funciona.
- No cambio el `IntroLoader` ni otros lienzos puntuales.
