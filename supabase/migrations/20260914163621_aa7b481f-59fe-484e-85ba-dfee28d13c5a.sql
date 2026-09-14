CREATE TABLE public.ugc_token_accounts (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_tokens integer NOT NULL DEFAULT 20,
  plan text NOT NULL DEFAULT 'trial',
  monthly_tokens integer NOT NULL DEFAULT 0,
  renews_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ugc_token_accounts TO authenticated;
GRANT ALL ON public.ugc_token_accounts TO service_role;
ALTER TABLE public.ugc_token_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own token account" ON public.ugc_token_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.ugc_token_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta_tokens integer NOT NULL,
  reason text NOT NULL,
  video_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ugc_token_ledger_user_idx ON public.ugc_token_ledger (user_id, created_at DESC);
GRANT SELECT ON public.ugc_token_ledger TO authenticated;
GRANT ALL ON public.ugc_token_ledger TO service_role;
ALTER TABLE public.ugc_token_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own token ledger" ON public.ugc_token_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.ugc_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  character_brief text,
  tone text,
  brand_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ugc_projects TO authenticated;
GRANT ALL ON public.ugc_projects TO service_role;
ALTER TABLE public.ugc_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ugc projects" ON public.ugc_projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ugc_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ugc_products TO authenticated;
GRANT ALL ON public.ugc_products TO service_role;
ALTER TABLE public.ugc_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ugc products" ON public.ugc_products FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.ugc_videos
  ADD COLUMN project_id uuid REFERENCES public.ugc_projects(id) ON DELETE SET NULL,
  ADD COLUMN product_id uuid REFERENCES public.ugc_products(id) ON DELETE SET NULL,
  ADD COLUMN tokens_charged integer NOT NULL DEFAULT 0,
  ADD COLUMN tokens_refunded boolean NOT NULL DEFAULT false;

CREATE TRIGGER ugc_projects_updated_at BEFORE UPDATE ON public.ugc_projects FOR EACH ROW EXECUTE FUNCTION public.set_ugc_videos_updated_at();
CREATE TRIGGER ugc_products_updated_at BEFORE UPDATE ON public.ugc_products FOR EACH ROW EXECUTE FUNCTION public.set_ugc_videos_updated_at();
CREATE TRIGGER ugc_token_accounts_updated_at BEFORE UPDATE ON public.ugc_token_accounts FOR EACH ROW EXECUTE FUNCTION public.set_ugc_videos_updated_at();

CREATE OR REPLACE FUNCTION public.ugc_charge_tokens(_user_id uuid, _tokens integer, _reason text, _video_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  IF _tokens IS NULL OR _tokens <= 0 THEN
    RAISE EXCEPTION 'invalid token amount';
  END IF;

  INSERT INTO public.ugc_token_accounts (user_id)
  VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.ugc_token_accounts
     SET balance_tokens = balance_tokens - _tokens
   WHERE user_id = _user_id
     AND balance_tokens >= _tokens
  RETURNING balance_tokens INTO new_balance;

  IF new_balance IS NULL THEN
    RETURN -1;
  END IF;

  INSERT INTO public.ugc_token_ledger (user_id, delta_tokens, reason, video_id)
  VALUES (_user_id, -_tokens, _reason, _video_id);

  RETURN new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.ugc_grant_tokens(_user_id uuid, _tokens integer, _reason text, _video_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  IF _tokens IS NULL OR _tokens <= 0 THEN
    RAISE EXCEPTION 'invalid token amount';
  END IF;

  INSERT INTO public.ugc_token_accounts (user_id, balance_tokens)
  VALUES (_user_id, 20 + _tokens)
  ON CONFLICT (user_id) DO UPDATE SET balance_tokens = public.ugc_token_accounts.balance_tokens + _tokens
  RETURNING balance_tokens INTO new_balance;

  INSERT INTO public.ugc_token_ledger (user_id, delta_tokens, reason, video_id)
  VALUES (_user_id, _tokens, _reason, _video_id);

  RETURN new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.ugc_charge_tokens(uuid, integer, text, uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.ugc_grant_tokens(uuid, integer, text, uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ugc_charge_tokens(uuid, integer, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.ugc_grant_tokens(uuid, integer, text, uuid) TO service_role;