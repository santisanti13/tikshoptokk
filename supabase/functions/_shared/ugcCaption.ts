// Ficha para publicar: título, descripción con hashtags y nombre de tarjeta.

export type Caption = {
  title: string;
  description: string;
  hashtags: string[];
  card: string;
};

export const CAPTION_SYSTEM = `Eres redactor de publicaciones de TikTok Shop en España.
Escribes en español de España, cercano y sin sonar a anuncio.
Devuelve un JSON con esta forma exacta:
{"title": "string de máximo 80 caracteres",
 "description": "2 o 3 frases naturales, sin hashtags dentro",
 "hashtags": ["5 hashtags en minúscula, sin espacios, relevantes para el producto y el nicho"],
 "card": "nombre de la tarjeta de producto, máximo 30 caracteres"}
Reglas: nada de promesas médicas ni datos inventados; usa solo lo que aparezca en el contexto.`;

export function normalizeCaption(raw: unknown, disclaimer?: string | null): Caption {
  const value = (raw ?? {}) as Record<string, unknown>;
  const hashtags = Array.isArray(value.hashtags)
    ? value.hashtags
        .map((h) => String(h).trim().replace(/^#*/, "#").toLowerCase())
        .filter((h) => h.length > 1)
        .slice(0, 5)
    : [];
  let description = String(value.description ?? "").trim();
  if (disclaimer && !description.includes(disclaimer)) description = `${description}\n\n${disclaimer}`;
  return {
    title: String(value.title ?? "").trim().slice(0, 80),
    description,
    hashtags,
    card: String(value.card ?? "").trim().slice(0, 30),
  };
}
