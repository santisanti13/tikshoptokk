CREATE TABLE public.ugc_carousels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.ugc_products(id) ON DELETE SET NULL,
  style_id text NOT NULL,
  headline text,
  slides jsonb NOT NULL DEFAULT '[]'::jsonb,
  caption jsonb,
  status text NOT NULL DEFAULT 'completed',
  error_message text,
  tokens_charged integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ugc_carousels TO authenticated;
GRANT ALL ON public.ugc_carousels TO service_role;

ALTER TABLE public.ugc_carousels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ugc carousels"
ON public.ugc_carousels FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER ugc_carousels_updated_at
BEFORE UPDATE ON public.ugc_carousels
FOR EACH ROW EXECUTE FUNCTION public.set_ugc_videos_updated_at();

ALTER TABLE public.ugc_videos ADD COLUMN IF NOT EXISTS caption jsonb;