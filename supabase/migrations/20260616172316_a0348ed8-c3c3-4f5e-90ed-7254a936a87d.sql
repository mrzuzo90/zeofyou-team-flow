
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'task',
  ADD COLUMN IF NOT EXISTS horizon text,
  ADD COLUMN IF NOT EXISTS target_minutes integer,
  ADD COLUMN IF NOT EXISTS progress smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS progress_mode text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS minutes_spent integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS started_at timestamptz;

-- Trigger: sumar minutos a la misión al insertar focus session
CREATE OR REPLACE FUNCTION public.apply_focus_session_to_mission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m_target integer;
  m_mode text;
  m_minutes integer;
BEGIN
  IF NEW.mission_id IS NULL OR NEW.duration_minutes IS NULL OR NEW.duration_minutes <= 0 THEN
    RETURN NEW;
  END IF;

  UPDATE public.missions
    SET minutes_spent = minutes_spent + NEW.duration_minutes,
        started_at = COALESCE(started_at, now())
    WHERE id = NEW.mission_id
    RETURNING target_minutes, progress_mode, minutes_spent INTO m_target, m_mode, m_minutes;

  IF m_mode = 'time' AND m_target IS NOT NULL AND m_target > 0 THEN
    UPDATE public.missions
      SET progress = LEAST(100, ROUND(m_minutes::numeric * 100 / m_target))
      WHERE id = NEW.mission_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_focus_session_to_mission ON public.focus_sessions;
CREATE TRIGGER trg_focus_session_to_mission
  AFTER INSERT ON public.focus_sessions
  FOR EACH ROW EXECUTE FUNCTION public.apply_focus_session_to_mission();

-- Trigger: forzar progress=100 al completar
CREATE OR REPLACE FUNCTION public.sync_mission_progress_on_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    NEW.progress := 100;
  END IF;
  IF NEW.status = 'in_progress' AND NEW.started_at IS NULL THEN
    NEW.started_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mission_progress_sync ON public.missions;
CREATE TRIGGER trg_mission_progress_sync
  BEFORE INSERT OR UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.sync_mission_progress_on_status();
