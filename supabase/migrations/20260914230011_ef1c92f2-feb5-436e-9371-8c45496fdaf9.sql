ALTER TABLE public.ugc_products
  ADD COLUMN IF NOT EXISTS blind_spots text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS model_path text,
  ADD COLUMN IF NOT EXISTS render_paths text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.ugc_videos
  ADD COLUMN IF NOT EXISTS source_url text;