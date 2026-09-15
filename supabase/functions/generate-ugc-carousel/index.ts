// Carrusel de imágenes para TikTok Shop: escribe los textos de cada lámina,
// genera sus imágenes y devuelve el carrusel listo. El texto se compone en la
// web sobre la imagen, para que siempre se lea.

import { createClient } from "npm:@supabase/supabase-js@2";
import { chatJson, generateImage, toBase64, AiError } from "../_shared/ugcAi.ts";
import { getCarouselStyle, CAROUSEL_TOKENS } from "../_shared/ugcCarouselStyles.ts";
import { CAPTION_SYSTEM, normalizeCaption } from "../_shared/ugcCaption.ts";
import { complianceBlock, complianceDisclaimer } from "../_shared/ugcCompliance.ts";
import { blindSpotsBlock } from "../_shared/ugcBlindSpots.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SYSTEM = `Eres director creativo de carruseles de TikTok Shop en España.
Devuelve un JSON con esta forma exacta:
{"headline": "titular corto del carrusel",
 "slides": [{"text": "texto que irá sobrepuesto en la lámina, máximo 90 caracteres, sin hashtags", "image": "descripción de la foto de esa lámina en español, realista, estilo foto de móvil, sin texto en la imagen"}],
 "caption": {"title": "string", "description": "string", "hashtags": ["5 hashtags"], "card": "máximo 30 caracteres"}}
El número de láminas es exactamente el que se te indique. Español de España, cercano, sin sonar a anuncio, sin datos inventados.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "Falta la configuración de IA." }, 500);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Inicia sesión para usar el estudio." }, 401);

    const body = await req.json();
    const style = getCarouselStyle(typeof body?.styleId === "string" ? body.styleId : null);
    if (!style) return json({ error: "Elige un estilo de carrusel." }, 400);
    const productId = typeof body?.productId === "string" ? body.productId : null;
    const idea = String(body?.idea ?? "").trim();

    let productText = "";
    let blind = "";
    let reference: { data: string; mimeType: string } | null = null;

    if (productId) {
      const { data: product } = await userClient
        .from("ugc_products")
        .select("name, description, blind_spots, image_path")
        .eq("id", productId)
        .maybeSingle();
      if (product) {
        productText = [product.name, product.description].filter(Boolean).join(" — ");
        blind = blindSpotsBlock(product.blind_spots as string | null) ?? "";
        if (product.image_path) {
          const file = await admin.storage.from("ugc-products").download(product.image_path);
          if (file.data) {
            const bytes = new Uint8Array(await file.data.arrayBuffer());
            reference = { data: toBase64(bytes), mimeType: file.data.type || "image/jpeg" };
          }
        }
      }
    }

    if (!productText && idea.length < 3) {
      return json({ error: "Elige un producto de tu biblioteca o escribe la idea del carrusel." }, 400);
    }

    const categoryText = `${productText} ${idea}`;
    const compliance = complianceBlock(categoryText);

    // Cobro previo; se devuelve si algo falla después.
    const { data: balance, error: chargeError } = await admin.rpc("ugc_charge_tokens", {
      _user_id: user.id,
      _tokens: CAROUSEL_TOKENS,
      _reason: "carousel_generation",
    });
    if (chargeError) return json({ error: "No se pudo registrar el consumo de tokens." }, 500);
    if (balance === -1) {
      return json(
        { error: `Te faltan tokens: un carrusel cuesta ${CAROUSEL_TOKENS}. Recarga tu saldo para continuar.`, needTokens: CAROUSEL_TOKENS },
        402,
      );
    }
    const refund = async () => {
      await admin.rpc("ugc_grant_tokens", { _user_id: user.id, _tokens: CAROUSEL_TOKENS, _reason: "carousel_refund" });
    };

    try {
      const context = [
        `Estilo: ${style.label} — ${style.hint}`,
        `Número exacto de láminas: ${style.slides}`,
        `Guía visual de las imágenes: ${style.visual}`,
        `Guía de redacción: ${style.copy}`,
        productText ? `Producto: ${productText}` : "",
        blind,
        idea ? `Idea del usuario: ${idea}` : "",
        compliance,
        CAPTION_SYSTEM,
      ]
        .filter(Boolean)
        .join("\n");

      const written = await chatJson<{
        headline?: string;
        slides?: { text?: string; image?: string }[];
        caption?: unknown;
      }>(apiKey, context, SYSTEM);

      const slides = (Array.isArray(written.slides) ? written.slides : []).slice(0, style.slides);
      if (slides.length === 0) throw new AiError(502, "La IA no ha devuelto láminas.");

      const carouselId = crypto.randomUUID();

      const images = await Promise.all(
        slides.map(async (slide, index) => {
          const prompt = [
            `Fotografía vertical 9:16 hecha con móvil, realista y creíble, sin texto ni logos superpuestos, sin marcas de agua.`,
            style.visual,
            `Lámina ${index + 1} de ${slides.length}: ${String(slide.image ?? slide.text ?? productText)}`,
            reference
              ? "El producto debe ser exactamente el de la imagen de referencia adjunta: misma forma, mismo color, mismo envase y logo visible. No lo rediseñes."
              : "",
            blind,
          ]
            .filter(Boolean)
            .join("\n");
          const bytes = await generateImage(apiKey, prompt, reference ? [reference] : []);
          const path = `${user.id}/carruseles/${carouselId}/${index + 1}.png`;
          const up = await admin.storage.from("ugc-videos").upload(path, bytes, {
            contentType: "image/png",
            upsert: true,
          });
          if (up.error) throw new Error(up.error.message);
          return { text: String(slide.text ?? "").trim().slice(0, 120), image_path: path };
        }),
      );

      const caption = normalizeCaption(written.caption, complianceDisclaimer(categoryText));

      const { data: row, error } = await userClient
        .from("ugc_carousels")
        .insert({
          id: carouselId,
          user_id: user.id,
          product_id: productId,
          style_id: style.id,
          headline: String(written.headline ?? "").trim() || null,
          slides: images,
          caption,
          status: "completed",
          tokens_charged: CAROUSEL_TOKENS,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);

      return json({ carousel: row, tokensCharged: CAROUSEL_TOKENS, balance });
    } catch (inner) {
      await refund();
      if (inner instanceof AiError) return json({ error: inner.message }, inner.status);
      console.error("carousel generation error", inner);
      return json({ error: "No se pudo crear el carrusel. Te hemos devuelto los tokens." }, 500);
    }
  } catch (e) {
    console.error("generate-ugc-carousel error", e);
    return json({ error: "Error inesperado al crear el carrusel." }, 500);
  }
});
