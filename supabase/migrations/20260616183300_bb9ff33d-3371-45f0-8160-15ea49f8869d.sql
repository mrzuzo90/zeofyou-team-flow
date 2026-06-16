ALTER TABLE public.identities
  ADD COLUMN IF NOT EXISTS persona text,
  ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{}'::jsonb;