
-- Mission milestones (sub-tasks/hitos for long-term missions)
CREATE TABLE public.mission_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  weight integer NOT NULL DEFAULT 1,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_milestones TO authenticated;
GRANT ALL ON public.mission_milestones TO service_role;
ALTER TABLE public.mission_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own milestones" ON public.mission_milestones
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_mission_milestones_updated_at
  BEFORE UPDATE ON public.mission_milestones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_mission_milestones_mission ON public.mission_milestones(mission_id);

-- Recalculate mission progress from milestones when in manual mode
CREATE OR REPLACE FUNCTION public.recalc_mission_progress_from_milestones()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  m_id uuid;
  m_mode text;
  total_weight integer;
  done_weight integer;
BEGIN
  m_id := COALESCE(NEW.mission_id, OLD.mission_id);
  SELECT progress_mode INTO m_mode FROM public.missions WHERE id = m_id;
  IF m_mode <> 'manual' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  SELECT COALESCE(SUM(weight), 0), COALESCE(SUM(CASE WHEN done THEN weight ELSE 0 END), 0)
    INTO total_weight, done_weight
    FROM public.mission_milestones WHERE mission_id = m_id;
  IF total_weight > 0 THEN
    UPDATE public.missions
      SET progress = ROUND(done_weight::numeric * 100 / total_weight)
      WHERE id = m_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_milestones_recalc
  AFTER INSERT OR UPDATE OR DELETE ON public.mission_milestones
  FOR EACH ROW EXECUTE FUNCTION public.recalc_mission_progress_from_milestones();

-- Coach chat messages
CREATE TABLE public.coach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  identity_voice text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.coach_messages TO authenticated;
GRANT ALL ON public.coach_messages TO service_role;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own coach messages" ON public.coach_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_coach_messages_user_created ON public.coach_messages(user_id, created_at DESC);
