# Dotar de personalidad a las identidades existentes

Las identidades creadas antes del cambio tienen `persona = null` y siguen viéndose con el look genérico. Las migramos a un arquetipo automáticamente, sin perder nada de lo que el usuario ya configuró.

## Estrategia de mapeo

Para cada identidad existente sin `persona`, se asigna una basándose primero en una coincidencia por **nombre** (las semilla del onboarding son reconocibles), y si no encaja, por **color heredado**.

### Por nombre (case-insensitive, incluye variantes con "El/La")

| Coincide con…                                          | Persona       |
|--------------------------------------------------------|---------------|
| estratega, planificador, visionario                    | `strategist`  |
| creativo, artista, innovador, director de innovación   | `creator`     |
| organizador, analista, gestor, analítico               | `analyst`     |
| coach, cuidador, bienestar, sanador                    | `caregiver`   |
| explorador, aventurero, viajero                        | `explorer`    |
| negociador, mediador, comunicador                      | `negotiator`  |
| guerrero, atleta, luchador                             | `warrior`     |
| soñador, místico, filósofo                             | `dreamer`     |

### Fallback por color (mismo mapa que ya usa `resolvePersona`)

`emerald → caregiver`, `violet → negotiator`, `sky → analyst`, `amber → explorer`, `rose → creator`. Cualquier otra cosa → `strategist`.

## Implementación

Una sola migración SQL (data update, no schema change). Usa el patrón insert/update:

```sql
UPDATE public.identities
SET persona = CASE
  WHEN persona IS NOT NULL THEN persona
  WHEN lower(name) ~ '(estratega|planificador|visionario)' THEN 'strategist'
  WHEN lower(name) ~ '(creativo|artista|innovador|innovación)' THEN 'creator'
  WHEN lower(name) ~ '(organizador|analista|gestor|analítico|analitico)' THEN 'analyst'
  WHEN lower(name) ~ '(coach|cuidador|bienestar|sanador)' THEN 'caregiver'
  WHEN lower(name) ~ '(explorador|aventurero|viajero)' THEN 'explorer'
  WHEN lower(name) ~ '(negociador|mediador|comunicador)' THEN 'negotiator'
  WHEN lower(name) ~ '(guerrero|atleta|luchador)' THEN 'warrior'
  WHEN lower(name) ~ '(soñador|sonador|místico|mistico|filósofo|filosofo)' THEN 'dreamer'
  WHEN color = 'violet' THEN 'negotiator'
  WHEN color = 'sky' THEN 'analyst'
  WHEN color = 'amber' THEN 'explorer'
  WHEN color = 'rose' THEN 'creator'
  WHEN color = 'emerald' THEN 'caregiver'
  ELSE 'strategist'
END
WHERE persona IS NULL;
```

Como es un update (no cambia schema), se ejecuta vía la tool `supabase--insert`. Resultado: las 4 semilla por defecto (Estratega, Creativo, Organizador, Coach) reciben respectivamente `strategist`, `creator`, `analyst`, `caregiver`.

## Cambio adicional (semilla futura)

Actualizar `handle_new_user()` para que las 4 identidades por defecto se creen ya con `persona` asignada — así los usuarios nuevos no necesitan backfill nunca.

## Fuera de alcance

- No cambiar nombres, colores, descripciones ni roles existentes.
- No tocar las preferencias (`preferences`) del usuario; quedan vacías hasta que personalice.
