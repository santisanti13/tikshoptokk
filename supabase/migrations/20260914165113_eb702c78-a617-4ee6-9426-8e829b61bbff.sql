REVOKE ALL ON public.payment_events FROM anon, authenticated;
REVOKE ALL ON public.subscriptions FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated;
REVOKE ALL ON FUNCTION public.ugc_set_plan(uuid, text, integer, timestamptz) FROM anon, authenticated;