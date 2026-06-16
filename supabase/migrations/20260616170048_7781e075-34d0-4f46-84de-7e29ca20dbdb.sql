ALTER TABLE public.identities ADD COLUMN IF NOT EXISTS context text;
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS context text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_mode text NOT NULL DEFAULT 'work';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mode_auto_suggest boolean NOT NULL DEFAULT true;

ALTER TABLE public.identities DROP CONSTRAINT IF EXISTS identities_context_check;
ALTER TABLE public.identities ADD CONSTRAINT identities_context_check CHECK (context IS NULL OR context IN ('work','home','family','travel'));
ALTER TABLE public.missions DROP CONSTRAINT IF EXISTS missions_context_check;
ALTER TABLE public.missions ADD CONSTRAINT missions_context_check CHECK (context IS NULL OR context IN ('work','home','family','travel'));
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_current_mode_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_current_mode_check CHECK (current_mode IN ('work','home','family','travel','none'));