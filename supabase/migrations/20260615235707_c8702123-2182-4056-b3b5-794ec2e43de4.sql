
-- ENUMS
CREATE TYPE public.identity_status AS ENUM ('active', 'resting', 'paused');
CREATE TYPE public.mission_status AS ENUM ('pending', 'in_progress', 'completed', 'archived');
CREATE TYPE public.mission_priority AS ENUM ('low', 'medium', 'high');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  preferences JSONB NOT NULL DEFAULT '{"pomodoroMinutes":25,"breakMinutes":5,"theme":"dark"}'::jsonb,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- IDENTITIES
CREATE TABLE public.identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  specialty TEXT,
  color TEXT NOT NULL DEFAULT 'emerald',
  avatar TEXT,
  energy INT NOT NULL DEFAULT 80 CHECK (energy >= 0 AND energy <= 100),
  status public.identity_status NOT NULL DEFAULT 'resting',
  total_xp INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.identities TO authenticated;
GRANT ALL ON public.identities TO service_role;
ALTER TABLE public.identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own identities all" ON public.identities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- MISSIONS
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_identity_id UUID REFERENCES public.identities(id) ON DELETE SET NULL,
  status public.mission_status NOT NULL DEFAULT 'pending',
  priority public.mission_priority NOT NULL DEFAULT 'medium',
  category TEXT,
  due_date DATE,
  xp_reward INT NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.missions TO authenticated;
GRANT ALL ON public.missions TO service_role;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own missions all" ON public.missions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FOCUS SESSIONS
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_id UUID REFERENCES public.identities(id) ON DELETE SET NULL,
  mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  duration_minutes INT NOT NULL,
  pomodoros_completed INT NOT NULL DEFAULT 1,
  notes TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.focus_sessions TO authenticated;
GRANT ALL ON public.focus_sessions TO service_role;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own focus all" ON public.focus_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ACHIEVEMENTS catalog (public read)
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  rarity TEXT NOT NULL DEFAULT 'common',
  xp_reward INT NOT NULL DEFAULT 100
);
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements public read" ON public.achievements FOR SELECT TO authenticated USING (true);

INSERT INTO public.achievements (id, name, description, icon, rarity, xp_reward) VALUES
  ('first_focus', 'Primera Sesión', 'Completa tu primera sesión de Focus', 'zap', 'common', 50),
  ('streak_7', 'Constancia', '7 días seguidos activo', 'flame', 'rare', 200),
  ('missions_10', 'Operativo', 'Completa 10 misiones', 'target', 'rare', 250),
  ('focus_marathon', 'Maratoniano', 'Acumula 10 horas de Focus', 'clock', 'epic', 500),
  ('balanced_team', 'Equipo Equilibrado', 'Usa las 4 identidades en una misma semana', 'users', 'epic', 400),
  ('mission_master', 'Comandante', 'Completa 50 misiones', 'crown', 'legendary', 1000);

-- USER ACHIEVEMENTS
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
GRANT SELECT, INSERT, DELETE ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own user_achievements all" ON public.user_achievements FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DAILY METRICS (cached snapshot for insights)
CREATE TABLE public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avg_energy INT NOT NULL DEFAULT 0,
  focus_minutes INT NOT NULL DEFAULT 0,
  missions_completed INT NOT NULL DEFAULT 0,
  top_identity_id UUID REFERENCES public.identities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_metrics TO authenticated;
GRANT ALL ON public.daily_metrics TO service_role;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own daily_metrics all" ON public.daily_metrics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_identities_updated BEFORE UPDATE ON public.identities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_missions_updated BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile + seed identities on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.identities (user_id, name, role, description, specialty, color, status, energy) VALUES
    (NEW.id, 'El Estratega', 'Planificador Principal', 'Visión a largo plazo y decisiones estratégicas', 'Estrategia', 'emerald', 'active', 88),
    (NEW.id, 'El Creativo', 'Director de Innovación', 'Genera ideas originales y soluciones creativas', 'Creatividad', 'violet', 'resting', 72),
    (NEW.id, 'El Organizador', 'Gestor de Procesos', 'Mantiene todo estructurado y funcionando', 'Organización', 'sky', 'active', 80),
    (NEW.id, 'El Coach', 'Bienestar Personal', 'Cuida del equilibrio emocional y la motivación', 'Bienestar', 'amber', 'resting', 90);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
