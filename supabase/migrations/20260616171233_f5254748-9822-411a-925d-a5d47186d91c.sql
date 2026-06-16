-- 1. Historial de modos
CREATE TABLE public.mode_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL CHECK (mode IN ('work','home','family','travel','none')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mode_sessions TO authenticated;
GRANT ALL ON public.mode_sessions TO service_role;
ALTER TABLE public.mode_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mode_sessions" ON public.mode_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX mode_sessions_user_started_idx ON public.mode_sessions(user_id, started_at DESC);

-- 2. Check-ins de energía
CREATE TABLE public.energy_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  level smallint NOT NULL CHECK (level BETWEEN 1 AND 5),
  mood text,
  note text,
  mode text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.energy_checkins TO authenticated;
GRANT ALL ON public.energy_checkins TO service_role;
ALTER TABLE public.energy_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own energy_checkins" ON public.energy_checkins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX energy_checkins_user_created_idx ON public.energy_checkins(user_id, created_at DESC);

-- 3. Notas de transición entre modos
CREATE TABLE public.transition_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_mode text,
  to_mode text NOT NULL,
  leaving text,
  bringing text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transition_notes TO authenticated;
GRANT ALL ON public.transition_notes TO service_role;
ALTER TABLE public.transition_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own transition_notes" ON public.transition_notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Brain dumps (entradas clasificadas)
CREATE TABLE public.brain_dumps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('mission','idea','worry','note')),
  context text CHECK (context IS NULL OR context IN ('work','home','family','travel')),
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brain_dumps TO authenticated;
GRANT ALL ON public.brain_dumps TO service_role;
ALTER TABLE public.brain_dumps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own brain_dumps" ON public.brain_dumps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX brain_dumps_user_created_idx ON public.brain_dumps(user_id, created_at DESC);

-- 5. Resúmenes semanales (cache por semana ISO)
CREATE TABLE public.weekly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  iso_week text NOT NULL,
  summary text NOT NULL,
  suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, iso_week)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_summaries TO authenticated;
GRANT ALL ON public.weekly_summaries TO service_role;
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own weekly_summaries" ON public.weekly_summaries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Preferencias en profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS transition_ritual_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS energy_checkin_enabled boolean NOT NULL DEFAULT true;