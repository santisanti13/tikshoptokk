// Ficha para publicar de un vídeo ya generado: título, descripción con
// hashtags y nombre de la tarjeta de producto.

import { createClient } from "npm:@supabase/supabase-js@2";
import { chatJson, AiError } from "../_shared/ugcAi.ts";
import { CAPTION_SYSTEM, normalizeCaption } from "../_shared/ugcCaption.ts";
import { complianceBlock, complianceDisclaimer } from "../_shared/ugcCompliance.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "Falta la configuración de IA." }, 500);

    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return json({ error: "Inicia sesión para usar el estudio." }, 401);

    const body = await req.json();
    const videoId = typeof body?.videoId === "string" ? body.videoId : null;
    if (!videoId) return json({ error: "Falta el vídeo." }, 400);

    const { data: video } = await userClient
      .from("ugc_videos")
      .select("id, prompt, product_id")
      .eq("id", videoId)
      .maybeSingle();
    if (!video) return json({ error: "No encontramos ese vídeo." }, 404);

    let productText = "";
    if (video.product_id) {
      const { data: product } = await userClient
        .from("ugc_products")
        .select("name, description, blind_spots")
        .eq("id", video.product_id)
        .maybeSingle();
      if (product) {
        productText = [product.name, product.description, product.blind_spots].filter(Boolean).join(" — ");
      }
    }

    const categoryText = `${productText} ${video.prompt}`;
    const context = [
      productText ? `Producto: ${productText}` : "",
      `Guion del vídeo:\n${String(video.prompt).slice(0, 1200)}`,
      complianceBlock(categoryText),
    ]
      .filter(Boolean)
      .join("\n\n");

    const raw = await chatJson<unknown>(apiKey, context, CAPTION_SYSTEM);
    const caption = normalizeCaption(raw, complianceDisclaimer(categoryText));

    await userClient.from("ugc_videos").update({ caption }).eq("id", videoId);

    return json({ caption });
  } catch (e) {
    if (e instanceof AiError) return json({ error: e.message }, e.status);
    console.error("ugc-caption error", e);
    return json({ error: "No hemos podido escribir la ficha." }, 500);
  }
});
