CREATE TABLE public.tiktok_go_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  profile_type text NOT NULL,
  business_name text,
  city text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.tiktok_go_waitlist TO anon, authenticated;
GRANT ALL ON public.tiktok_go_waitlist TO service_role;

ALTER TABLE public.tiktok_go_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede apuntarse a la lista de espera"
ON public.tiktok_go_waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);