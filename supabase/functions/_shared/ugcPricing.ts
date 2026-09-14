// Tarifa alineada con src/lib/ugcPricing.ts: margen bruto > 4x en todas las
// combinaciones de calidad y duración, incluso al precio efectivo más bajo
// (plan Studio, 0,20 €/token) y con el crédito de IA a 0,25 €.
export const TOKENS_PER_SECOND: Record<string, number> = {
  "360p": 1,
  "720p": 1.5,
  "1080p": 2.5,
};

export const ASSISTANT_TOKEN_COST = 1;

export function tokensForVideo(resolution: string, durationSeconds: number): number {
  const perSecond = TOKENS_PER_SECOND[resolution] ?? TOKENS_PER_SECOND["720p"];
  return Math.max(1, Math.ceil(perSecond * durationSeconds));
}
