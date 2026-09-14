ALTER TABLE public.ugc_token_accounts ALTER COLUMN balance_tokens SET DEFAULT 5;

CREATE OR REPLACE FUNCTION public.ugc_grant_tokens(_user_id uuid, _tokens integer, _reason text, _video_id uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_balance integer;
BEGIN
  IF _tokens IS NULL OR _tokens <= 0 THEN
    RAISE EXCEPTION 'invalid token amount';
  END IF;

  INSERT INTO public.ugc_token_accounts (user_id, balance_tokens)
  VALUES (_user_id, 5 + _tokens)
  ON CONFLICT (user_id) DO UPDATE SET balance_tokens = public.ugc_token_accounts.balance_tokens + _tokens
  RETURNING balance_tokens INTO new_balance;

  INSERT INTO public.ugc_token_ledger (user_id, delta_tokens, reason, video_id)
  VALUES (_user_id, _tokens, _reason, _video_id);

  RETURN new_balance;
END;
$function$;