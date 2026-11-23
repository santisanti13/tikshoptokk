DROP POLICY IF EXISTS "Cualquiera puede apuntarse a la lista de espera" ON public.tiktok_go_waitlist;
CREATE POLICY "Cualquiera puede apuntarse a la lista de espera" ON public.tiktok_go_waitlist
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 120
  AND char_length(email) <= 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(profile_type) BETWEEN 1 AND 60
  AND (business_name IS NULL OR char_length(business_name) <= 160)
  AND (city IS NULL OR char_length(city) <= 120)
  AND (message IS NULL OR char_length(message) <= 2000)
);

DROP POLICY IF EXISTS "Anyone can read market snapshots" ON public.market_snapshots;
CREATE POLICY "Anyone can read market snapshots" ON public.market_snapshots
FOR SELECT TO anon, authenticated
USING (captured_on <= current_date AND country = 'ES');