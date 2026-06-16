# Plan de mejoras Zeofyou

Voy a abordar las mejoras de mayor impacto en 3 fases, priorizando lo que más nota un usuario diario.

## Fase 1 — UX inmediato (quick wins visibles)

1. **Empty states ricos** en Dashboard, Misiones, Identidades, Insights e Historial: ilustración + copy con la voz de cada identidad + CTA sugerido.
2. **Skeletons** sustituyendo los spinners actuales (Dashboard, Misiones, Insights).
3. **Microfeedback**:
   - Confetti al completar misión.
   - Pulso en el botón Focus cuando hay una misión activa sin sesión hoy.
   - Animación de "respiración" en el indicador de energía cuando está bajo.
4. **Undo toasts** en lugar de modales de confirmación al borrar misión / identidad / brain dump.

## Fase 2 — Usabilidad y navegación

5. **Command palette (⌘K / Ctrl+K)** con:
   - Ir a cualquier sección.
   - Crear misión rápida.
   - Iniciar focus.
   - Cambiar de modo.
   - Buscar misiones/identidades.
6. **Atajos globales**: `N` nueva misión, `F` focus, `M` cambiar modo, `B` brain dump, `?` mostrar atajos.
7. **Búsqueda global** integrada en el palette (missions + identities + brain dumps).
8. **Swipe gestures en móvil** sobre tarjetas de misión: izquierda → completar, derecha → +15min.

## Fase 3 — Funcionalidades nuevas de alto valor

9. **Sub-tareas/hitos en misiones de largo plazo**: lista de hitos con su propio check, recalculan el % de la misión madre cuando `progress_mode = 'manual'`.
   - Nueva tabla `mission_milestones` (mission_id, title, done, order, weight opcional).
   - UI: acordeón dentro de `MissionProgress` para añadir/marcar hitos.
10. **Coach conversacional IA** (Lovable AI, `google/gemini-3-flash-preview`):
    - Botón "Habla con tu equipo" en Dashboard.
    - Edge function recibe contexto (modo actual, energía hoy, misiones activas, últimas sesiones) y responde con la voz de la identidad dominante del modo.
    - Historial guardado en nueva tabla `coach_messages`.
11. **Heatmap anual de minutos de focus** (estilo GitHub) en Insights, agrupando por identidad con filtro.
12. **Plantillas de misión** (idioma, libro, hábito, proyecto): prellenan horizonte, horas objetivo y hitos sugeridos.

## Lo que dejo fuera por ahora

- Notificaciones push (requiere config de service worker + permisos, mejor en sprint dedicado).
- Integración Google/Apple Calendar (OAuth + scopes, sprint propio).
- Modo equipo / compartir (cambia modelo de permisos, decisión de producto).
- Export PDF semanal (lo dejo para después del coach IA, que generará el resumen).

## Detalles técnicos

- **Command palette**: `cmdk` (ya viene con shadcn `Command`). Provider global en `Layout`.
- **Atajos**: hook `useHotkeys` propio sobre `keydown`, respetando inputs.
- **Swipe**: `framer-motion` `drag="x"` con thresholds.
- **Skeletons**: componentes `Skeleton` de shadcn ya disponibles.
- **Confetti**: `canvas-confetti` (ligero, sin deps).
- **Undo toast**: usar `sonner` con `action` que revierte el delete (delete optimista, restore si action).
- **Sub-tareas**: migración nueva con tabla `mission_milestones`, RLS por `user_id` vía join, GRANTs a `authenticated` y `service_role`. Trigger que recalcula `missions.progress` cuando `progress_mode='manual'`.
- **Coach IA**: edge function `coach-chat` con streaming, llama a Lovable AI Gateway. Manejo de 402/429 con toasts claros.
- **Heatmap**: agregación en cliente sobre `focus_sessions` del último año, componente SVG propio (52x7 celdas).
- **Plantillas**: array tipado en `src/data/missionTemplates.ts`, modal de selección al crear misión.

## Orden de entrega

Fase 1 → Fase 2 → Fase 3, commiteando cada fase por separado para que puedas probar antes de seguir. Si en algún punto quieres parar o reordenar, dímelo.

¿Le doy a todo o quieres quitar/reordenar algo?
