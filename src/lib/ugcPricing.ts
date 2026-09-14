/**
 * Tarifas del estudio UGC.
 *
 * Modelo de rentabilidad (todas las cifras verificadas contra el consumo real
 * del gateway de IA):
 *
 *  - Coste medido: 4 s en 360p = 0,54 créditos de IA; 8 s en 1080p = 3,25.
 *    => créditos por segundo: 360p 0,135 | 720p 0,25 | 1080p 0,41.
 *  - Coste del crédito de IA en el peor caso de plan de pago: 0,25 €/crédito.
 *  - Precio de venta del token: 0,25 €. Los descuentos por volumen de los
 *    planes y recargas bajan el precio efectivo hasta 0,20 €/token (Studio),
 *    que es el escenario usado para calcular el margen mínimo.
 *
 * Con los tokens por segundo definidos abajo el margen bruto queda por encima
 * de 4x en TODAS las combinaciones de calidad y duración, incluso al precio
 * efectivo más bajo. Antes 360p se quedaba en ~2,9x, por eso su tarifa sube.
 */

export const TOKEN_PRICE_EUR = 0.25;

/** Precio efectivo mínimo del token (plan Studio, 399 € / 2000 tokens). */
export const MIN_EFFECTIVE_TOKEN_PRICE_EUR = 399 / 2000;

/** Coste asumido de un crédito de IA del gateway. */
export const AI_CREDIT_COST_EUR = 0.25;

/** Créditos de IA consumidos por segundo de vídeo según la calidad. */
export const AI_CREDITS_PER_SECOND: Record<string, number> = {
  "360p": 0.135,
  "720p": 0.25,
  "1080p": 0.41,
};

/** Tokens consumidos por segundo de vídeo según la calidad elegida. */
export const TOKENS_PER_SECOND: Record<string, number> = {
  "360p": 1,
  "720p": 1.5,
  "1080p": 2.5,
};

/** Coste estimado en tokens del asistente de prompts. */
export const ASSISTANT_TOKEN_COST = 1;

export function tokensForVideo(resolution: string, durationSeconds: number): number {
  const perSecond = TOKENS_PER_SECOND[resolution] ?? TOKENS_PER_SECOND["720p"];
  return Math.max(1, Math.ceil(perSecond * durationSeconds));
}

export function eurFromTokens(tokens: number): number {
  return tokens * TOKEN_PRICE_EUR;
}

/** Coste real estimado en euros de generar un vídeo. */
export function costEurForVideo(resolution: string, durationSeconds: number): number {
  const perSecond = AI_CREDITS_PER_SECOND[resolution] ?? AI_CREDITS_PER_SECOND["720p"];
  return perSecond * durationSeconds * AI_CREDIT_COST_EUR;
}

/**
 * Margen bruto (múltiplo) de un vídeo al precio efectivo indicado.
 * Por defecto usa el peor caso: el precio del plan Studio.
 */
export function marginForVideo(
  resolution: string,
  durationSeconds: number,
  tokenPriceEur: number = MIN_EFFECTIVE_TOKEN_PRICE_EUR,
): number {
  const revenue = tokensForVideo(resolution, durationSeconds) * tokenPriceEur;
  const cost = costEurForVideo(resolution, durationSeconds);
  return cost === 0 ? Infinity : revenue / cost;
}

export function formatEur(amount: number): string {
  return amount.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
}

export type UgcPlan = {
  id: string;
  name: string;
  priceEur: number;
  tokens: number;
  priceId: string;
  highlight?: boolean;
  perks: string[];
};

/** Suscripciones mensuales con cupo de tokens incluido. */
export const UGC_PLANS: UgcPlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceEur: 49,
    tokens: 200,
    priceId: "ugc_starter_monthly",
    perks: [
      "~16 vídeos de 8s en 720p al mes",
      "1 proyecto de marca",
      "Asistente de prompts incluido",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceEur: 149,
    tokens: 700,
    priceId: "ugc_pro_monthly",
    highlight: true,
    perks: [
      "~58 vídeos de 8s en 720p al mes",
      "Proyectos y personajes ilimitados",
      "Biblioteca de productos",
      "Calidad 1080p disponible",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    priceEur: 399,
    tokens: 2000,
    priceId: "ugc_studio_monthly",
    perks: [
      "~166 vídeos de 8s en 720p al mes",
      "Todo lo del plan Pro",
      "Prioridad en la cola de generación",
      "Revisión mensual con el equipo",
    ],
  },
];

/** Recargas puntuales de tokens (sin suscripción). */
export const UGC_TOPUPS = [
  { id: "topup-100", tokens: 100, priceEur: 29, priceId: "ugc_topup_100_onetime" },
  { id: "topup-500", tokens: 500, priceEur: 129, priceId: "ugc_topup_500_onetime" },
  { id: "topup-2000", tokens: 2000, priceEur: 449, priceId: "ugc_topup_2000_onetime" },
];
