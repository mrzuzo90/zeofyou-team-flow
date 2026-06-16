# Arreglar: las tarjetas siguen viéndose iguales

En el screenshot las 4 identidades muestran el mismo glass oscuro, la misma fuente serif itálica y ninguna textura. Los anillos de energía sí cambian de color, pero la personalidad visual no llega a las tarjetas.

## Causas que voy a verificar y corregir

1. **Las fuentes arbitrarias `font-[Sora]`, `font-[Playfair_Display]`… no se están aplicando.**
   Aunque están como literales en `src/lib/personas.ts`, hay algo que está sobrescribiéndolas (probablemente el `font-display` del Layout o un cascade global). Las verifico en runtime y, si confirmo el problema, sustituyo `personaFontClass()` por `personaFontStyle()` que devuelve `style={{ fontFamily: "..." }}` con la familia completa entrecomillada. Esto es a prueba de purga y de cascade.

2. **El pseudo-elemento `.persona-card::before` queda tapado por el `glass-card`.**
   `glass-card` aplica `background` propio que cubre cualquier `::before` translúcido. Lo arreglo de dos formas combinadas:
   - Subir `opacity` y `mix-blend-mode: screen` al `::before` para que la textura/gradiente del arquetipo se vea sobre el glass.
   - Forzar `border-color` desde la clase de persona con `!important` para que el borde de cada arquetipo se note (estratega: hairline indigo, guerrero: 2px rojo, mono: borde nítido, etc.).
   - En `Identities.tsx`, dejar de aplicar `glass-card` cuando ya hay `persona-card` — `PersonaSurface` actualmente acepta `base="glass" | "bare"`; lo dejaré en `bare` y la propia clase de arquetipo aporta fondo translúcido propio (mediante un `background` semi-transparente derivado de `--persona-accent`).

3. **El backfill puede no haberse aplicado a TU usuario en concreto.**
   El `UPDATE` se lanzó global. Si por algún motivo tu identidad ya tenía `persona = ''` (string vacío en vez de null), la condición `WHERE persona IS NULL` no la tocaría. Compruebo con un `SELECT id, name, persona FROM identities`. Si veo strings vacíos, relanzo el update con `WHERE persona IS NULL OR persona = ''`.

## Cambios concretos

- **`src/lib/personas.ts`**: añadir `personaFontStyle(p): CSSProperties` que devuelve la familia completa entrecomillada (`'"Playfair Display", serif'`, `'"JetBrains Mono", monospace'`, etc.). Mantener `personaFontClass` por compat pero dejar de usarlo en las páginas.
- **`src/components/UI/IdentityAvatar.tsx`**: usar `style={{ fontFamily: ... }}` en vez de la clase arbitraria.
- **`src/pages/Identities.tsx`**, **`src/pages/Focus.tsx`**, **`src/pages/Missions.tsx`**: aplicar `personaFontStyle` al nombre/título.
- **`src/components/Identity/PersonaSurface.tsx`**: cambiar default a `base="bare"` y dar a cada `.persona-card--*` su propio fondo translúcido (no glass).
- **`src/index.css`**: subir opacidad de `::before` a `1`, añadir `background-color` semi-translúcido por arquetipo (consume `--persona-accent`), y `border-*` con `!important` donde haga falta para vencer al border del glass-card que pueda quedar.
- **Verificación**: tras los cambios, abro `/identidades` y compruebo en el preview que las 4 cards se ven claramente distintas (Estratega minimal con grid, Creativo con halo cálido editorial, Organizador con borde mono y esquinas rectas, Coach con bordes muy redondeados y halo emerald).

## Fuera de alcance

- No cambio nada de los anillos de energía ni de los avatares (los avatares ya cambian de color por preset; si la fuente no se ve es por lo mismo de arriba).
- No añado más arquetipos ni edito el flujo de creación.
