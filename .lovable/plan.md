# Personalidad visual por identidad

Cada identidad pasa de ser "una tarjeta más con color" a tener su propio carácter: color de acento, fuente display, y un *estilo de tarjeta* (textura/borde/aura). Modelo híbrido: arquetipos como punto de partida + ajuste fino libre.

## Modelo de "persona visual"

Una identidad guarda una `persona` (string, opcional) que apunta a un preset, más overrides opcionales:

```text
identity.persona       → "strategist" | "creator" | "analyst" | ...
identity.color         → ya existe (ahora ampliado)
identity.preferences   → JSON: { font?, style?, accent? }  (override del preset)
```

Si `persona` no está, se usa un fallback derivado de `color` (compat con identidades viejas) — no hace falta migración destructiva.

### Arquetipos iniciales (8)

| Arquetipo     | Color base | Fuente display      | Estilo de tarjeta                          |
|---------------|------------|---------------------|--------------------------------------------|
| Estratega     | indigo     | Sora                | Minimal, borde nítido, grid sutil          |
| Creativo      | rose       | Playfair Display    | Editorial, gradiente cálido, blob orgánico |
| Analítico     | sky        | JetBrains Mono      | Técnico, líneas mono, esquinas rectas      |
| Cuidador      | emerald    | Manrope             | Cálido, esquinas muy redondeadas, halo soft|
| Explorador    | amber      | Space Grotesk       | Topográfico, textura de mapa al hover      |
| Negociador    | violet     | Inter Tight         | Glass elevado, borde duotono               |
| Guerrero      | red        | Archivo Black       | Brutalist, alto contraste, sombra dura     |
| Soñador       | fuchsia    | Cormorant Garamond  | Aurora difusa, serif itálica en nombre     |

Cada preset expone: `{ accent, accentSoft, gradient, fontDisplay, cardStyle, texture, glow }`.

## Arquitectura técnica

1. **`src/lib/personas.ts`** (nuevo)
   - `PERSONAS: Record<PersonaKey, PersonaPreset>` con tokens HSL semánticos por arquetipo (no clases hardcoded; expone variables CSS que se inyectan vía `style`).
   - `resolvePersona(identity)` → fusiona preset + overrides + fallback por color.
   - Helpers: `personaCardClass(p)`, `personaFontClass(p)`, `personaCSSVars(p)`.

2. **`src/index.css`**
   - Añadir `@font-face` / `<link>` para las fuentes display nuevas (vía `index.html`, no Tailwind config — son utilitarias por identidad).
   - Clases utilitarias: `.persona-card`, `.persona-card--editorial`, `.persona-card--brutalist`, `.persona-card--mono`, `.persona-card--organic`, `.persona-card--aurora`, `.persona-card--topo`, `.persona-card--minimal`. Cada una solo define textura/borde/sombra, **consume** `--persona-accent` y `--persona-accent-soft` del contenedor.

3. **Componente `<PersonaSurface identity>`** (nuevo, en `src/components/Identity/PersonaSurface.tsx`)
   - Envuelve children inyectando `style={personaCSSVars(p)}` + clase de cardStyle.
   - Sustituye al `GlassCard` plano en los sitios donde queremos que se note la personalidad.

4. **`IdentityAvatar`** (editar)
   - Acepta `identity` opcional (o `persona`) además del actual `color`. Usa gradiente del preset, glow del preset, y radio según `cardStyle` (cuadrado para brutalist/mono, círculo blando para organic, etc.).

5. **Badges con nombre de identidad**
   - Nuevo `<IdentityChip identity>` que aplica color + micro-acento de fuente al nombre. Reemplaza los `<span>` actuales en Misiones, Insights y Focus.

## Edición (UI)

6. **Diálogo "Nueva identidad" en `src/pages/Identities.tsx`**
   - Paso 1: elegir arquetipo (grid 2×4 de tarjetas-preview que muestran el look real).
   - Paso 2: campos actuales (nombre, rol, especialidad, descripción).
   - Paso 3 (colapsable "Personalizar"): override de color / fuente / estilo.
   - Guarda `persona` + `preferences` (JSON con overrides) además de los campos actuales.

7. **Editar identidad existente**
   - Botón "Personalizar look" en la tarjeta abre el mismo diálogo en modo edición.

## Alcance de la personalidad en la app

8. **`/identidades`** → cada tarjeta usa `<PersonaSurface>`. Mantiene la grid actual, pero cada celda se ve claramente distinta.
9. **Avatares + chips de identidad** en Misiones, Focus, Insights, Dashboard → usan preset (color + fuente del nombre).
10. **Misiones asociadas** → la tarjeta de misión gana una franja/acento del preset de su identidad responsable (sutil, no invade el diseño de la misión).
11. **Modo Focus** → cuando hay una identidad activa, el `AuroraCanvas` recibe el accent del preset (uniform extra) y el card central usa su `cardStyle`. Si no hay identidad, comportamiento actual.

## Base de datos

12. **Migración Supabase**: añadir columnas a `identities`:
    - `persona text` (nullable)
    - `preferences jsonb default '{}'::jsonb`
    Sin políticas nuevas (heredan las existentes de la tabla). Sin GRANT nuevos.

## Fuera de alcance

- Editor visual avanzado tipo "Figma" para identidades (lo dejamos en presets + overrides simples).
- Cambiar el sistema de modos o el tema claro/oscuro global.
- Animaciones nuevas más allá de las ya existentes (TiltCard, Aurora).

## Riesgos / decisiones

- **Coherencia visual**: con 8 arquetipos hay riesgo de "circo". Mitigación: todos comparten radios base, espaciado y tipografía de cuerpo (Manrope); solo varían acento, fuente del *display* y textura.
- **Carga de fuentes**: 6 fuentes nuevas. Las cargamos con `display=swap` y `subset=latin` desde Google Fonts en `index.html`.
- **Compat retro**: identidades sin `persona` se mapean automáticamente por su `color` actual → ninguna se rompe.
