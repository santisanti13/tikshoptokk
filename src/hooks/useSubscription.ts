import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment, paymentsConfigured } from "@/lib/stripe";
import { planForPrice, type CatalogEntry } from "@/lib/planCatalog";

export type SubscriptionRow = {
  id: string;
  price_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  created_at: string;
};

export type TokenAccount = {
  balance_tokens: number;
  plan: string;
  monthly_tokens: number;
  renews_at: string | null;
};

export type SubscriptionState = {
  loading: boolean;
  userEmail: string | null;
  subscriptions: SubscriptionRow[];
  account: TokenAccount | null;
  /** Suscripción más reciente que todavía da acceso. */
  active: SubscriptionRow | null;
  activePlan: CatalogEntry | null;
  refresh: () => Promise<void>;
};

export function keepsAccess(row: SubscriptionRow): boolean {
  const end = row.current_period_end ? new Date(row.current_period_end).getTime() : null;
  const periodOpen = end === null || end > Date.now();
  if (["active", "trialing", "past_due"].includes(row.status)) return periodOpen;
  if (row.status === "canceled") return end !== null && end > Date.now();
  return false;
}

export function useSubscription(): SubscriptionState {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [account, setAccount] = useState<TokenAccount | null>(null);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    setUserEmail(user?.email ?? null);
    if (!user) {
      setSubscriptions([]);
      setAccount(null);
      setLoading(false);
      return;
    }

    if (paymentsConfigured()) {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("id, price_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at")
        .eq("user_id", user.id)
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false });
      setSubscriptions((subs as SubscriptionRow[] | null) ?? []);
    }

    const { data: acc } = await supabase
      .from("ugc_token_accounts")
      .select("balance_tokens, plan, monthly_tokens, renews_at")
      .eq("user_id", user.id)
      .maybeSingle();
    setAccount((acc as TokenAccount | null) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const active = subscriptions.find(keepsAccess) ?? null;

  return {
    loading,
    userEmail,
    subscriptions,
    account,
    active,
    activePlan: planForPrice(active?.price_id),
    refresh: load,
  };
}
