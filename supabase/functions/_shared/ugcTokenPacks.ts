/** Tokens que otorga cada precio del catálogo de pagos. */
export type TokenGrant = { tokens: number; plan?: string; recurring: boolean };

export const TOKEN_GRANTS: Record<string, TokenGrant> = {
  ugc_starter_monthly: { tokens: 200, plan: "starter", recurring: true },
  ugc_pro_monthly: { tokens: 700, plan: "pro", recurring: true },
  ugc_studio_monthly: { tokens: 2000, plan: "studio", recurring: true },
  ugc_topup_100_onetime: { tokens: 100, recurring: false },
  ugc_topup_500_onetime: { tokens: 500, recurring: false },
  ugc_topup_2000_onetime: { tokens: 2000, recurring: false },

  // Servicios de agencia: cada cobro incluye cupo de tokens del estudio UGC.
  ag_boost_monthly: { tokens: 250, plan: "ag_boost", recurring: true },
  ag_escala_monthly: { tokens: 600, plan: "ag_escala", recurring: true },
  ag_dominio_monthly: { tokens: 1200, plan: "ag_dominio", recurring: true },
  ag_lanzadera_onetime: { tokens: 400, recurring: false },
  ag_growth_monthly: { tokens: 800, plan: "ag_growth", recurring: true },
  ag_portfolio_monthly: { tokens: 2000, plan: "ag_portfolio", recurring: true },
  ag_diario_lite_monthly: { tokens: 400, plan: "ag_diario_lite", recurring: true },
  ag_diario_pro_monthly: { tokens: 800, plan: "ag_diario_pro", recurring: true },
  ag_full_commerce_monthly: { tokens: 1600, plan: "ag_full_commerce", recurring: true },
  ag_marca_personal_monthly: { tokens: 300, plan: "ag_marca_personal", recurring: true },
  ag_autoridad_monthly: { tokens: 650, plan: "ag_autoridad", recurring: true },
  ag_media_house_monthly: { tokens: 1500, plan: "ag_media_house", recurring: true },
};

export function grantForPrice(priceId?: string | null): TokenGrant | null {
  if (!priceId) return null;
  return TOKEN_GRANTS[priceId] ?? null;
}
