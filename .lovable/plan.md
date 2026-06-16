# Fix: el cambio de modo no se aplica

## Causa raíz

`src/pages/Transition.tsx` llama a `setMode(to)` desde `finish()` y `skipAll()`. Ese `setMode` (en `src/hooks/useCurrentMode.ts`) detecta que el ritual está activo y vuelve a navegar a `/transicion?from=…&to=…` en lugar de persistir el cambio. Resultado: `profiles.current_mode` nunca se actualiza, y el usuario percibe que el selector "no hace nada".

## Cambios

1. **`src/pages/Transition.tsx`**
   - En `finish()` y `skipAll()`, llamar `setMode(to, { skipRitual: true })` para que se ejecute el `update.mutate` y se navegue a `/` sin re-disparar el ritual.
   - Esperar a que la mutación termine antes de `nav("/")` para evitar leer estado obsoleto al volver al dashboard (usar `await update.mutateAsync` exponiendo un helper o usando directamente el patch desde aquí).

2. **`src/hooks/useCurrentMode.ts`**
   - Exponer una versión async/garantizada del `setMode` (`setModeAsync`) o devolver la promesa de `update.mutateAsync` cuando `skipRitual` es true, para que `Transition` pueda await-earla antes de navegar.
   - Aprovechar para evitar registrar `record.mutate` en el primer render si `lastMode` aún es null (ya hecho) y asegurar que se registra al volver de la transición.

3. **Verificación manual tras el fix**
   - Abrir el selector, elegir otro modo → completar o saltar el ritual → confirmar en el badge superior y en `data-mode` del `<html>` que cambia, y que `profiles.current_mode` queda actualizado.

## Out of scope

- No tocar el diseño del ritual ni los pasos.
- No cambiar la lógica de sugerencia automática por horario.
