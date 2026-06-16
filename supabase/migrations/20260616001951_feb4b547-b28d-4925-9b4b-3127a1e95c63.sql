
CREATE TABLE IF NOT EXISTS public.onboarding_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text,
  life_context text,
  ambitions text[] NOT NULL DEFAULT '{}',
  current_projects text,
  concerns text,
  raw_answers jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_profiles TO authenticated;
GRANT ALL ON public.onboarding_profiles TO service_role;

ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own onboarding read" ON public.onboarding_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own onboarding insert" ON public.onboarding_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own onboarding update" ON public.onboarding_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own onboarding delete" ON public.onboarding_profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_onboarding_profiles_updated_at
  BEFORE UPDATE ON public.onboarding_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
