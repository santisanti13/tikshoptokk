/**
 * Tarifas del estudio UGC.
 *
 * Todo el consumo se mide en "tokens". Un token equivale a 0,25 € de precio de
 * venta y el coste de generación por token queda ~4x por debajo, de forma que
 * cualquier combinación de duración y calidad mantiene el margen objetivo.
 */

export const TOKEN_PRICE_EUR = 0.25;

/** Tokens consumidos por segundo de vídeo según la calidad elegida. */
export const TOKENS_PER_SECOND: Record<string, number> = {
  "360p": 0.5,
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
  { id: "topup-100", tokens: 100, priceEur: 29 },
  { id: "topup-500", tokens: 500, priceEur: 129 },
  { id: "topup-2000", tokens: 2000, priceEur: 449 },
];
