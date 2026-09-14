/** Tokens que otorga cada precio del catálogo de pagos. */
export type TokenGrant = { tokens: number; plan?: string; recurring: boolean };

export const TOKEN_GRANTS: Record<string, TokenGrant> = {
  ugc_starter_monthly: { tokens: 200, plan: "starter", recurring: true },
  ugc_pro_monthly: { tokens: 700, plan: "pro", recurring: true },
  ugc_studio_monthly: { tokens: 2000, plan: "studio", recurring: true },
  ugc_topup_100_onetime: { tokens: 100, recurring: false },
  ugc_topup_500_onetime: { tokens: 500, recurring: false },
  ugc_topup_2000_onetime: { tokens: 2000, recurring: false },
};

export function grantForPrice(priceId?: string | null): TokenGrant | null {
  if (!priceId) return null;
  return TOKEN_GRANTS[priceId] ?? null;
}
