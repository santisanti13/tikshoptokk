CREATE TABLE public.ugc_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  job_id TEXT,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  error_message TEXT,
  resolution TEXT NOT NULL DEFAULT '720p',
  duration_seconds NUMERIC NOT NULL DEFAULT 8,
  aspect_ratio TEXT,
  has_start_image BOOLEAN NOT NULL DEFAULT false,
  video_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ugc_videos TO authenticated;
GRANT ALL ON public.ugc_videos TO service_role;

ALTER TABLE public.ugc_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own ugc videos"
ON public.ugc_videos FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX ugc_videos_user_created_idx ON public.ugc_videos (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_ugc_videos_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER ugc_videos_updated_at BEFORE UPDATE ON public.ugc_videos
FOR EACH ROW EXECUTE FUNCTION public.set_ugc_videos_updated_at();

REVOKE ALL ON FUNCTION public.set_ugc_videos_updated_at() FROM anon, authenticated;