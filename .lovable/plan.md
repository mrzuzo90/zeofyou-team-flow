# Misiones de largo plazo con progreso 0-100

Sí, muy buena idea. Hoy las misiones son binarias (pendiente/completada). Vamos a añadir un tipo persistente con horizonte temporal, progreso explícito y tiempo dedicado.

## Cambios en base de datos (migración)

Tabla `missions` — añadir:
- `kind` text default `'task'` — valores: `'task'` (rápida, como hasta ahora) o `'long_term'` (persistente).
- `horizon` text null — valores: `'week'`, `'month'`, `'quarter'`, `'year'`. Solo se usa cuando `kind = 'long_term'`.
- `target_minutes` integer null — minutos objetivo opcionales para misiones de largo plazo (p. ej. 2000 min para un proyecto).
- `progress` smallint default 0 — porcentaje 0-100 fijado manualmente o calculado a partir de minutos dedicados.
- `progress_mode` text default `'manual'` — `'manual'` (el usuario mueve el slider) o `'time'` (se calcula como `minutes_spent / target_minutes`).
- `minutes_spent` integer default 0 — minutos acumulados desde focus_sessions y entradas manuales.
- `started_at` timestamptz null — primera vez que pasó a `in_progress`.

Trigger: cuando se inserta una `focus_sessions` con `mission_id`, sumar `duration_minutes` a `missions.minutes_spent` y, si `progress_mode = 'time'` y `target_minutes > 0`, recalcular `progress = LEAST(100, ROUND(minutes_spent*100/target_minutes))`.

## UI

1. **Crear/editar misión** (`Missions.tsx` form): nuevo toggle "Misión de largo plazo". Si activa, mostrar selector de horizonte, campo opcional de horas objetivo y selector de modo de progreso (manual/por tiempo).
2. **Card de misión**:
   - Para `long_term`: barra de progreso 0-100, badge del horizonte, "Xh dedicadas / Yh objetivo" (o sólo Xh si no hay objetivo), botón "+15 min" rápido y slider de progreso si está en modo manual.
   - Para `task`: igual que ahora.
3. **Dashboard**: sección "En curso" con las top 3 long-term ordenadas por progreso reciente.
4. **Focus mode**: cuando se completa un pomodoro vinculado a una misión long-term, mostrar el delta de progreso.

## Hooks/lib

- `useMissions` y tipo `Mission`: añadir los nuevos campos.
- `useUpdateMission`: ya sirve para `progress`, `minutes_spent`, etc.
- Nuevo helper `useLogMissionTime(missionId, minutes)` que inserta en `focus_sessions` o actualiza directo (`minutes_spent`) según el caso.
- Componente `<MissionProgress />` reutilizable (barra + texto + slider opcional).

## Detalles técnicos

- El trigger usa SECURITY DEFINER y `SET search_path = public`.
- `progress` se ignora si `status = 'completed'` (se fuerza a 100).
- Al pasar `status` a `'completed'`, fijar `progress = 100`.
- Migración solo añade columnas + trigger; no rompe datos existentes (default `kind = 'task'`).

## Out of scope

- Sub-tareas o hitos dentro de una misión long-term.
- Estimaciones automáticas con IA del progreso.
- Recordatorios calendarizados.
