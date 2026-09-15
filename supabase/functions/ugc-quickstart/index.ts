// De captura a contenido: lee la captura de la ficha de TikTok Shop, crea el
// producto en la biblioteca del usuario y devuelve guion y ficha para publicar.

import { createClient } from "npm:@supabase/supabase-js@2";
import { chatJson, AiError } from "../_shared/ugcAi.ts";
import { getPreset, UGC_PRESETS } from "../_shared/ugcPresets.ts";
import { CAPTION_SYSTEM, normalizeCaption } from "../_shared/ugcCaption.ts";
import { complianceBlock, complianceDisclaimer } from "../_shared/ugcCompliance.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Listing = {
  name?: string;
  price?: string;
  seller?: string;
  category?: string;
  selling_points?: string[];
  blind_spots?: string;
  suggested_preset?: string;
};

const READ_SYSTEM = `Eres analista de fichas de producto de TikTok Shop.
Recibes una captura de pantalla de una ficha de producto (o del propio producto).
Devuelve un JSON con esta forma exacta:
{"name": "nombre comercial del producto tal como aparece, sin emojis",
 "price": "precio con moneda si se ve, si no cadena vacía",
 "seller": "nombre de la tienda o vendedor si se ve, si no cadena vacía",
 "category": "categoría breve en español (por ejemplo: cosmética, suplementos, hogar, moda)",
 "selling_points": ["2 a 4 argumentos de venta cortos que se lean en la captura"],
 "blind_spots": "datos del producto que no se ven en la imagen y conviene fijar (color interior, material, tamaño real…), en una o dos frases; cadena vacía si no procede",
 "suggested_preset": "id del estilo de vídeo que mejor le encaja"}
No inventes datos que no aparezcan: si algo no se ve, deja la cadena vacía.`;

const SCRIPT_SYSTEM = `Eres director creativo de vídeo UGC para TikTok Shop.
Devuelve un JSON con esta forma exacta:
{"script": "prompt de vídeo en español, 60-130 palabras, una sola escena, plano continuo, con el diálogo introducido por dos puntos y terminando en 'Plano continuo, sin cortes de escena. Sin texto en pantalla.'",
 "caption": {"title": "string", "description": "string", "hashtags": ["5 hashtags"], "card": "máximo 30 caracteres"}}
Estilo casero y creíble, nunca publicitario. No inventes datos del producto.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "Falta la configuración de IA." }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Inicia sesión para usar el estudio." }, 401);

    const body = await req.json();
    const image = body?.image as { data?: string; mimeType?: string } | undefined;
    if (!image?.data || !image?.mimeType) {
      return json({ error: "Sube la captura de la ficha del producto." }, 400);
    }

    // 1. Leemos la captura.
    const listing = await chatJson<Listing>(
      apiKey,
      [
        {
          type: "text",
          text: `Estilos de vídeo disponibles: ${UGC_PRESETS.map((p) => `${p.id} (${p.label})`).join(", ")}.`,
        },
        { type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.data}` } },
      ],
      READ_SYSTEM,
    );

    const name = String(listing.name ?? "").trim() || "Producto sin nombre";
    const points = Array.isArray(listing.selling_points) ? listing.selling_points.map((p) => String(p).trim()).filter(Boolean) : [];
    const description = [
      listing.price ? `Precio: ${listing.price}.` : "",
      listing.seller ? `Vendedor: ${listing.seller}.` : "",
      points.length ? points.join(" · ") : "",
    ]
      .filter(Boolean)
      .join(" ");
    const categoryText = [name, listing.category, description].filter(Boolean).join(" ");

    // 2. Guardamos el producto con su foto en la biblioteca del usuario.
    const binary = atob(image.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const ext = image.mimeType.includes("png") ? "png" : "jpg";
    const path = `${user.id}/captura-${crypto.randomUUID()}.${ext}`;
    const upload = await userClient.storage.from("ugc-products").upload(path, bytes, {
      contentType: image.mimeType,
      upsert: false,
    });

    const { data: product, error: productError } = await userClient
      .from("ugc_products")
      .insert({
        user_id: user.id,
        name,
        description,
        blind_spots: String(listing.blind_spots ?? "").trim() || null,
        image_path: upload.error ? null : path,
      })
      .select("id, name, description, image_path, blind_spots, source_url, model_path, render_paths")
      .single();
    if (productError) return json({ error: "No se pudo guardar el producto." }, 500);

    // 3. Guion y ficha para publicar.
    const presetId = getPreset(String(listing.suggested_preset ?? ""))?.id
      ?? (typeof body?.presetId === "string" ? getPreset(body.presetId)?.id : null)
      ?? "cara";
    const preset = getPreset(presetId)!;
    const compliance = complianceBlock(categoryText);

    const context = [
      `Producto: ${name}`,
      description ? `Ficha: ${description}` : "",
      listing.category ? `Categoría: ${listing.category}` : "",
      `Estilo pedido: ${preset.label} — ${preset.hint}`,
      `Cómo escribirlo: ${preset.guidance}`,
      `Base técnica que debe reflejarse: ${preset.recipe}`,
      `Guion de referencia (imita el estilo, no el contenido):\n${preset.examples[0]}`,
      CAPTION_SYSTEM,
      compliance,
      "El vídeo parte de la foto del producto, así que no describas su aspecto: describe el momento y el movimiento.",
    ]
      .filter(Boolean)
      .join("\n");

    const written = await chatJson<{ script?: string; caption?: unknown }>(apiKey, context, SCRIPT_SYSTEM);

    return json({
      product,
      presetId,
      aspectRatio: preset.aspectRatio ?? "9:16",
      listing: { name, price: listing.price ?? "", seller: listing.seller ?? "", category: listing.category ?? "" },
      prompt: String(written.script ?? "").trim(),
      caption: normalizeCaption(written.caption, complianceDisclaimer(categoryText)),
    });
  } catch (e) {
    if (e instanceof AiError) return json({ error: e.message }, e.status);
    console.error("ugc-quickstart error", e);
    return json({ error: "No hemos podido leer la captura. Prueba con otra imagen." }, 500);
  }
});
