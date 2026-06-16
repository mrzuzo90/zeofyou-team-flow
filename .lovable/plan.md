# Modo claro/oscuro con memoria por contexto

Añadir un selector claro/oscuro independiente para cada **modo de contexto** (work, home, family, none). El tema preferido de cada modo se recuerda, de forma que al cambiar de "Trabajo" a "Familia" se aplica automáticamente el tema que el usuario eligió para ese contexto (p. ej. oscuro en Trabajo, claro en Familia).

## Comportamiento

- Cada modo (`work`, `home`, `family`, `none`) tiene su propio tema (`dark` o `light`).
- Al cambiar de modo: se aplica el tema guardado para ese modo (fallback `dark`).
- Al pulsar el toggle: cambia el tema **del modo activo** y se guarda.
- Persistencia: `localStorage` (`zeofyou.themeByMode`) para respuesta instantánea + sincronización al perfil del usuario en backend para que viaje entre dispositivos.
- Respeta `prefers-color-scheme` solo la **primera vez** que un modo no tiene preferencia guardada.

## Diseño de los tokens claros

Mantener la misma identidad Aurora (verde esmeralda + violeta + azul) ajustando luminosidad para garantizar contraste WCAG AA en ambos modos:

- Fondo claro: `--background: 220 30% 97%`, superficies `220 30% 100%` / `220 25% 94%`.
- Texto: `--foreground: 222 35% 12%`, `--muted-foreground: 220 15% 35%`.
- Primary/accent: mismos tonos, luminosidad reducida (`primary 142 65% 38%`, `accent 252 70% 50%`) para legibilidad sobre blanco.
- Gradientes hero, glass y sombras reformulados (radiales más suaves, sombras con `hsl(220 40% 20% / 0.12)`).
- Sidebar, popover, border, input ajustados al esquema claro.
- Variantes claras también para los overrides `data-mode="home"` y `data-mode="family"` (los tres modos × dos temas).

## Cambios técnicos

1. **`src/index.css`**
   - Añadir bloque `html[data-theme="light"] :root` con todos los tokens semánticos en versión clara.
   - Añadir overrides `html[data-theme="light"][data-mode="home"]` y `…[data-mode="family"]` (primary/accent/gradiente coherentes con el modo).
   - Revisar `--shadow-glass`, `--gradient-card`, `--gradient-hero` para que funcionen en claro (menos opacidad oscura, más blur).
   - Asegurar que ningún componente use clases hardcoded tipo `text-white` (auditar rápido y reemplazar si aparece).

2. **Nuevo `src/hooks/useTheme.ts`**
   - Estado `themeByMode: Record<ModeKey, 'light' | 'dark'>` persistido en `localStorage`.
   - Aplica `document.documentElement.dataset.theme` en función del modo activo (`useCurrentMode`).
   - API: `theme`, `toggleTheme()`, `setThemeForMode(mode, theme)`.
   - Sincroniza con `profile.preferences.themeByMode` (lectura inicial y escritura al cambiar) vía `useUpdateProfile`.

3. **`src/hooks/useCurrentMode.ts`**
   - Sin cambios funcionales; `useTheme` reacciona a `mode`.

4. **Nuevo `src/components/UI/ThemeToggle.tsx`**
   - Botón con icono Sun/Moon (lucide-react), animación spring (Framer Motion), tooltip "Tema para modo {modo}".
   - Glassmorphism coherente con `TopBar`.

5. **`src/components/Layout/TopBar.tsx`**
   - Insertar `<ThemeToggle />` junto al `ModeSwitcher`.

6. **`src/pages/Profile.tsx`**
   - Sección "Tema por modo": cuatro filas (Trabajo, Hogar, Familia, Sin modo) con su switch claro/oscuro, leyendo/escribiendo desde `useTheme`.

7. **Migración suave**
   - Si `profile.preferences.theme` existe (legacy), úsalo como tema por defecto para todos los modos en la primera carga, luego se sobrescribe individualmente.

## Fuera de alcance

- No se toca lógica de modos, misiones, focus ni datos.
- No se cambia tipografía ni layout.
- No se añade modo "sistema/auto" como tercera opción (solo claro/oscuro, según pidió el usuario); `prefers-color-scheme` se usa solo como fallback inicial.
