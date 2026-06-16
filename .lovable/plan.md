## Modos de contexto (Trabajo / Casa / Familia / Viaje)

Selector manual con sugerencia por horario. Filtra misiones e identidades, cambia tema visual y adapta la misión principal.

## Modelo de datos

Sin cambios estructurales grandes. Añadimos un único campo de **etiqueta de contexto** opcional en las tablas existentes para poder filtrar:

- `identities.context` (text, nullable) — uno de `work | home | family | travel` o `null` (visible siempre)
- `missions.context` (text, nullable) — idem
- `profiles.current_mode` (text, default `work`) — modo activo del usuario
- `profiles.mode_auto_suggest` (boolean, default true) — si mostrar la sugerencia por horario

Migración SQL con los `ALTER TABLE`, sin tocar RLS (las políticas existentes ya cubren `user_id`).

## Lógica de sugerencia por horario

Cliente puro, sin cron. Heurística por día/hora local:
- Lun-Vie 9-18 → `work`
- Lun-Vie 18-22 y fines de semana 10-20 → `home`
- Vie 20-23 y sáb/dom 10-14 → `family`
- Resto (madrugada, viajes detectados manualmente) → sin sugerencia

Si `current_mode ≠ sugerido` y `mode_auto_suggest = true`, mostramos un toast suave: *"Parece que es hora de modo Casa ¿activar?"* con botón. Nunca cambia solo.

## UI

1. **`ModeSwitcher`** en el `TopBar`: pill con icono + nombre del modo actual y dropdown con los 4 modos + opción "Sin modo (ver todo)".
2. **Tema visual por modo** vía atributo `data-mode` en `<html>`. En `index.css` añadimos overrides de tokens semánticos (`--primary`, `--accent`, `--background-gradient`) para cada modo:
   - `work` → verde-esmeralda actual (sobrio, foco)
   - `home` → ámbar/coral cálido
   - `family` → violeta suave
   - `travel` → azul cielo, más minimalista
3. **Filtrado**: hooks `useIdentities` y `useMissions` aceptan `mode` opcional y filtran `context === mode || context === null`. Dashboard, Identidades y Misiones pasan el modo actual.
4. **Misión principal del Dashboard**: si hay varias misiones primarias, prioriza la que coincida con el modo actual.
5. **Onboarding**: en el paso de misiones generadas por la IA, etiquetamos cada misión con un `context` por defecto según su categoría (heurística simple en el cliente). El usuario puede cambiarlo después desde la página de Misiones.
6. **Etiqueta editable**: en las tarjetas de Misión e Identidad añadimos un selector pequeño para asignar/cambiar contexto.

## Estado y persistencia

- `useCurrentMode()` hook: lee/escribe `profiles.current_mode`, expone `mode`, `setMode`, `suggested`.
- Aplica `document.documentElement.dataset.mode = mode` al cambiar.
- `useModeSuggestion()` calcula la sugerencia y dispara el toast (1 vez por cambio de franja, guardado en `sessionStorage`).

## Archivos

**Nuevos**
- `supabase/migrations/<ts>_context_modes.sql` (ALTER TABLEs)
- `src/lib/modes.ts` (constantes: modos, iconos, colores, heurística de horario, heurística de categoría→contexto)
- `src/hooks/useCurrentMode.ts`
- `src/hooks/useModeSuggestion.ts`
- `src/components/Mode/ModeSwitcher.tsx`
- `src/components/Mode/ContextBadge.tsx` (chip reutilizable para tarjetas)

**Editados**
- `src/index.css` (tokens por `[data-mode="..."]`)
- `src/components/Layout/TopBar.tsx` (insertar `ModeSwitcher`)
- `src/hooks/useIdentities.ts`, `src/hooks/useMissions.ts`, `src/hooks/useProfile.ts` (campo `current_mode`)
- `src/pages/Dashboard.tsx` (prioriza misión por modo, badge de modo en hero)
- `src/pages/Identities.tsx`, `src/pages/Missions.tsx` (filtro por modo + selector de contexto por tarjeta)
- `src/integrations/supabase/types.ts` (regen tras migración)

## Fuera de alcance

- Detección automática por GPS/Wi-Fi.
- Cambio automático (siempre será manual con sugerencia).
- Privacy Shield auto en modo trabajo (descartado en la respuesta del usuario).
- Notificaciones push.
