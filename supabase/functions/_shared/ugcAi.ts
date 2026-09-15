// Helpers del gateway de IA para el estudio (texto con salida JSON e imágenes).

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export class AiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function friendly(status: number, fallback: string): string {
  if (status === 402) return "No hay saldo de IA suficiente ahora mismo.";
  if (status === 429) return "Hay demasiadas generaciones en marcha. Prueba en un minuto.";
  return fallback;
}

type Content =
  | string
  | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

export async function chatJson<T>(
  apiKey: string,
  content: Content,
  system: string,
  model = "google/gemini-2.5-flash",
): Promise<T> {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: `${system}\n\nResponde SOLO con JSON válido, sin explicaciones ni bloques de código.` },
        { role: "user", content },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new AiError(res.status, friendly(res.status, err?.message ?? "La IA no ha podido responder."));
  }

  const data = await res.json();
  const raw = String(data?.choices?.[0]?.message?.content ?? "").trim();
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AiError(502, "La IA ha devuelto una respuesta que no hemos podido leer.");
  }
}

/** Genera una imagen y devuelve sus bytes PNG. */
export async function generateImage(
  apiKey: string,
  prompt: string,
  references: { data: string; mimeType: string }[] = [],
): Promise<Uint8Array> {
  const content: Content =
    references.length > 0
      ? [
          { type: "text", text: prompt },
          ...references.map((r) => ({
            type: "image_url" as const,
            image_url: { url: `data:${r.mimeType};base64,${r.data}` },
          })),
        ]
      : prompt;

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image",
      messages: [{ role: "user", content }],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new AiError(res.status, friendly(res.status, err?.message ?? "No se pudo generar la imagen."));
  }

  const data = await res.json();
  const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url as string | undefined;
  if (!url) throw new AiError(502, "La IA no ha devuelto ninguna imagen.");
  const base64 = url.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
