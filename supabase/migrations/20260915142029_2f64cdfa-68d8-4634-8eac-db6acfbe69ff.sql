CREATE OR REPLACE FUNCTION public.ugc_ensure_account()
RETURNS TABLE (balance_tokens integer, plan text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.ugc_token_accounts (user_id)
  VALUES (uid)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN QUERY
  SELECT a.balance_tokens, a.plan
  FROM public.ugc_token_accounts a
  WHERE a.user_id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.ugc_ensure_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ugc_ensure_account() TO authenticated;