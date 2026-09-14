CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.subscriptions IS '@graphql({"hide":true})';

CREATE TABLE public.payment_events (
  event_key text PRIMARY KEY,
  processed_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages payment events" ON public.payment_events
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.payment_events IS '@graphql({"hide":true})';

CREATE OR REPLACE FUNCTION public.ugc_set_plan(_user_id uuid, _plan text, _monthly_tokens integer, _renews_at timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ugc_token_accounts (user_id, plan, monthly_tokens, renews_at)
  VALUES (_user_id, _plan, _monthly_tokens, _renews_at)
  ON CONFLICT (user_id) DO UPDATE
    SET plan = EXCLUDED.plan,
        monthly_tokens = EXCLUDED.monthly_tokens,
        renews_at = EXCLUDED.renews_at,
        updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.ugc_set_plan(uuid, text, integer, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ugc_set_plan(uuid, text, integer, timestamptz) TO service_role;