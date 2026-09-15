import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

async function downloadImage(url: string | null): Promise<{ data: string; mimeType: string } | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > 8 * 1024 * 1024) return null;
    return { data: toBase64(bytes), mimeType: res.headers.get("content-type") ?? "image/jpeg" };
  } catch {
    return null;
  }
}

/** Portada, título y autor de un vídeo de TikTok vía oEmbed público. */
async function fromOembed(url: string) {
  const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data?.thumbnail_url && !data?.title) return null;
  return {
    kind: "video" as const,
    title: data.title ?? null,
    description: data.title ?? null,
    author: data.author_name ?? null,
    price: null as string | null,
    thumbnail: data.thumbnail_url ?? null,
  };
}

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const metaOf = (html: string, prop: string) => {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`,
    "i",
  );
  const m = html.match(re);
  return m ? (m[1] ?? m[2] ?? null) : null;
};

/** Lectura directa de la página de producto: TikTok suele servir las etiquetas og a un navegador. */
async function fromDirectFetch(url: string) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "es-ES,es;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    // TikTok devuelve un captcha ("Security Check") cuando bloquea la lectura.
    if (/security check|captcha/i.test(html.slice(0, 2000))) return null;
    const title = metaOf(html, "og:title") ?? html.match(/<title>([^<]{2,200})<\/title>/i)?.[1] ?? null;
    const description = metaOf(html, "og:description") ?? metaOf(html, "description");
    const thumbnail = metaOf(html, "og:image");
    const price = metaOf(html, "product:price:amount") ?? metaOf(html, "og:price:amount");
    const currency = metaOf(html, "product:price:currency") ?? metaOf(html, "og:price:currency");
    if (!title && !thumbnail) return null;
    return {
      kind: "product" as const,
      title,
      description: description ? description.slice(0, 600) : null,
      author: null as string | null,
      price: price ? `${price} ${currency ?? "EUR"}`.trim() : null,
      thumbnail,
    };
  } catch {
    return null;
  }
}

/** Ficha de un producto de TikTok Shop leyendo la página con Firecrawl. */
async function fromFirecrawl(url: string) {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) return null;
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true, timeout: 25000 }),
  });
  if (!res.ok) {
    console.error("firecrawl scrape failed", res.status, await res.text());
    return null;
  }
  const payload = await res.json().catch(() => null);
  const meta = payload?.data?.metadata ?? {};
  const markdown = String(payload?.data?.markdown ?? "").replace(/\s+/g, " ").trim();
  const priceMatch = markdown.match(/(\d{1,4}[.,]\d{2})\s*(€|EUR)/i) ?? markdown.match(/(€|EUR)\s*(\d{1,4}[.,]\d{2})/i);
  if (!meta.title && !markdown) return null;
  return {
    kind: "product" as const,
    title: meta.title ?? null,
    description: (meta.description ?? markdown).slice(0, 600) || null,
    author: null as string | null,
    price: priceMatch ? priceMatch[0] : null,
    thumbnail: meta.ogImage ?? meta["og:image"] ?? null,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return json({ error: "Inicia sesión para usar los enlaces de TikTok." }, 401);

    const body = await req.json();
    const url = String(body?.url ?? "").trim();
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return json({ error: "El enlace no es válido." }, 400);
    }
    if (!/(^|\.)tiktok\.com$/i.test(parsed.hostname)) {
      return json({ error: "Solo aceptamos enlaces de tiktok.com." }, 400);
    }

    const looksLikeProduct = /\/(view\/product|product|shop)\//i.test(parsed.pathname);
    const found = looksLikeProduct
      ? ((await fromFirecrawl(url)) ?? (await fromOembed(url)))
      : ((await fromOembed(url)) ?? (await fromFirecrawl(url)));

    if (!found) {
      return json(
        { error: "TikTok no ha dejado leer ese enlace. Sube la foto y escribe la ficha a mano." },
        422,
      );
    }

    const image = await downloadImage(found.thumbnail);

    return json({
      reference: {
        url,
        kind: found.kind,
        title: found.title,
        description: found.description,
        author: found.author,
        price: found.price,
        image,
      },
    });
  } catch (e) {
    console.error("tiktok-reference error", e);
    return json({ error: "No se pudo leer el enlace de TikTok." }, 500);
  }
});
