## Onboarding híbrido: formulario + sugerencias IA

Transformar `/bienvenida` de informativo a productivo: capturar contexto real del usuario y, al terminar, dejar la app poblada con identidades y misión inicial personalizadas.

### Flujo (5 pasos)

1. **Saludo + nombre y rol** (input text + select/input ocupación).
2. **Vida y entorno**: campo libre — familia, situación personal, contexto (textarea, opcional pero animado).
3. **Ambiciones**: 1-3 ambiciones de medio/largo plazo (chips dinámicos, mínimo 1).
4. **Proyectos y preocupaciones actuales**: dos textareas cortos (proyectos en curso / preocupaciones o bloqueos).
5. **Resumen IA**: llamada a edge function `onboarding-suggest` que devuelve:
   - 4 identidades personalizadas (nombre, rol, especialidad, color, energía inicial, descripción)
   - 1 misión principal sugerida derivada de las ambiciones/proyectos
   - 2-3 misiones secundarias
   El usuario las ve en tarjetas, puede editar nombre o eliminar antes de confirmar.

### Persistencia

- **Nueva tabla `onboarding_profiles`** (1-1 con `profiles`): `user_id`, `role`, `life_context`, `ambitions text[]`, `current_projects`, `concerns`, `raw_answers jsonb`. RLS por `auth.uid()`.
- Al confirmar paso 5:
  - Insert en `onboarding_profiles`.
  - **Reemplazar** las 4 identidades semilla del trigger por las sugeridas (delete + insert).
  - Insert de la misión primaria (`is_primary=true`) y las secundarias.
  - `profiles.onboarding_completed = true` y `display_name` actualizado.

### Edge function `onboarding-suggest`

- Input: `{ name, role, life_context, ambitions[], current_projects, concerns }`.
- Lovable AI Gateway, `google/gemini-3-flash-preview`, `Output.object` con Zod schema reducido (identidades + misiones). Prompt en español, tono cálido y específico.
- Devuelve sugerencias; el cliente las muestra editables.
- Manejo de 429/402 con toast claro y fallback a las 4 identidades por defecto + una misión genérica derivada de la primera ambición.

### UX

- Barra de progreso de 5 pasos (ya existe parcialmente).
- Animaciones framer-motion entre pasos.
- "Saltar resumen IA" → usa fallback determinista.
- Botón "Atrás" siempre disponible salvo en paso 1.
- Inputs validados con zod inline (mensajes en español, sin bloqueo agresivo).

### Archivos

- **Migración**: crear `onboarding_profiles` + grants + RLS.
- `supabase/functions/onboarding-suggest/index.ts` + `supabase/functions/_shared/ai-gateway.ts`.
- Reescribir `src/pages/Onboarding.tsx` con los 5 pasos y la llamada a la function.
- Nuevo hook `src/hooks/useOnboarding.ts` que orquesta el guardado final (transacción client-side: delete identidades, insert nuevas, insert misiones, update profile).
- Pequeños componentes en `src/components/Onboarding/`: `StepHeader`, `AmbitionsInput`, `SuggestionCard`.

### Fuera de alcance

- Chat conversacional puro (descartado a favor del híbrido).
- Generación de avatares con IA.
- Edge functions de IA semanal/diaria (siguen pendientes del plan anterior).

¿Procedo?