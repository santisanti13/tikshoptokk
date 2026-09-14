export const TOKENS_PER_SECOND: Record<string, number> = {
  "360p": 0.5,
  "720p": 1.5,
  "1080p": 2.5,
};

export const ASSISTANT_TOKEN_COST = 1;

export function tokensForVideo(resolution: string, durationSeconds: number): number {
  const perSecond = TOKENS_PER_SECOND[resolution] ?? TOKENS_PER_SECOND["720p"];
  return Math.max(1, Math.ceil(perSecond * durationSeconds));
}
