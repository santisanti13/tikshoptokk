CREATE TABLE public.ugc_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Personaje',
  image_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ugc_characters TO authenticated;
GRANT ALL ON public.ugc_characters TO service_role;

ALTER TABLE public.ugc_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own characters"
ON public.ugc_characters FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX ugc_characters_user_idx ON public.ugc_characters (user_id, created_at DESC);