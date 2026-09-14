/**
 * Catálogo único de planes vendibles (estudio UGC + servicios de agencia).
 * La clave es el priceId que se usa en el cobro con tarjeta.
 */

export type PlanKind = "ugc" | "agencia" | "recarga";

export type CatalogEntry = {
  priceId: string;
  name: string;
  kind: PlanKind;
  priceEur: number;
  recurring: boolean;
  /** Tokens del estudio que incluye cada cobro (0 en servicios de agencia). */
  tokens: number;
  line?: string;
};

export const PLAN_CATALOG: Record<string, CatalogEntry> = {
  ugc_starter_monthly: { priceId: "ugc_starter_monthly", name: "Starter", kind: "ugc", priceEur: 49, recurring: true, tokens: 200 },
  ugc_pro_monthly: { priceId: "ugc_pro_monthly", name: "Pro", kind: "ugc", priceEur: 149, recurring: true, tokens: 700 },
  ugc_studio_monthly: { priceId: "ugc_studio_monthly", name: "Studio", kind: "ugc", priceEur: 399, recurring: true, tokens: 2000 },

  ugc_topup_100_onetime: { priceId: "ugc_topup_100_onetime", name: "Recarga 100 tokens", kind: "recarga", priceEur: 29, recurring: false, tokens: 100 },
  ugc_topup_500_onetime: { priceId: "ugc_topup_500_onetime", name: "Recarga 500 tokens", kind: "recarga", priceEur: 129, recurring: false, tokens: 500 },
  ugc_topup_2000_onetime: { priceId: "ugc_topup_2000_onetime", name: "Recarga 2000 tokens", kind: "recarga", priceEur: 449, recurring: false, tokens: 2000 },

  ag_boost_monthly: { priceId: "ag_boost_monthly", name: "Boost", kind: "agencia", priceEur: 690, recurring: true, tokens: 0, line: "Escalar cuentas ya creadas" },
  ag_escala_monthly: { priceId: "ag_escala_monthly", name: "Escala", kind: "agencia", priceEur: 1490, recurring: true, tokens: 0, line: "Escalar cuentas ya creadas" },
  ag_dominio_monthly: { priceId: "ag_dominio_monthly", name: "Dominio", kind: "agencia", priceEur: 2900, recurring: true, tokens: 0, line: "Escalar cuentas ya creadas" },
  ag_lanzadera_onetime: { priceId: "ag_lanzadera_onetime", name: "Lanzadera", kind: "agencia", priceEur: 1200, recurring: false, tokens: 0, line: "Crear y lanzar cuentas" },
  ag_growth_monthly: { priceId: "ag_growth_monthly", name: "Growth", kind: "agencia", priceEur: 1900, recurring: true, tokens: 0, line: "Crear y lanzar cuentas" },
  ag_portfolio_monthly: { priceId: "ag_portfolio_monthly", name: "Portfolio", kind: "agencia", priceEur: 4500, recurring: true, tokens: 0, line: "Crear y lanzar cuentas" },
  ag_diario_lite_monthly: { priceId: "ag_diario_lite_monthly", name: "Diario Lite", kind: "agencia", priceEur: 890, recurring: true, tokens: 0, line: "Contenido diario para ecommerce" },
  ag_diario_pro_monthly: { priceId: "ag_diario_pro_monthly", name: "Diario Pro", kind: "agencia", priceEur: 1690, recurring: true, tokens: 0, line: "Contenido diario para ecommerce" },
  ag_full_commerce_monthly: { priceId: "ag_full_commerce_monthly", name: "Full Commerce", kind: "agencia", priceEur: 3200, recurring: true, tokens: 0, line: "Contenido diario para ecommerce" },
  ag_marca_personal_monthly: { priceId: "ag_marca_personal_monthly", name: "Marca Personal", kind: "agencia", priceEur: 750, recurring: true, tokens: 0, line: "Divulgación y entretenimiento" },
  ag_autoridad_monthly: { priceId: "ag_autoridad_monthly", name: "Autoridad", kind: "agencia", priceEur: 1550, recurring: true, tokens: 0, line: "Divulgación y entretenimiento" },
  ag_media_house_monthly: { priceId: "ag_media_house_monthly", name: "Media House", kind: "agencia", priceEur: 3500, recurring: true, tokens: 0, line: "Divulgación y entretenimiento" },
};

export function planForPrice(priceId?: string | null): CatalogEntry | null {
  if (!priceId) return null;
  return PLAN_CATALOG[priceId] ?? null;
}
