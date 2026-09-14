import { createClient } from "npm:@supabase/supabase-js@2";
import { tokensForVideo } from "../_shared/ugcPricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "Falta la configuración de IA." }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Inicia sesión para generar vídeos." }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    let prompt = String(body?.prompt ?? "").trim();
    if (prompt.length < 5) return json({ error: "Describe el vídeo con un poco más de detalle." }, 400);

    const resolution = ["360p", "720p", "1080p"].includes(body?.resolution) ? body.resolution : "720p";
    const durationRaw = Number(body?.duration ?? 8);
    const duration = Math.min(Math.max(Math.round(durationRaw) || 8, 3), 10);
    const aspectRatio = body?.aspectRatio === "16:9" ? "16:9" : "9:16";
    const projectId = typeof body?.projectId === "string" ? body.projectId : null;
    const productId = typeof body?.productId === "string" ? body.productId : null;

    // Contexto del proyecto: mantiene el mismo personaje en todas las piezas.
    if (projectId) {
      const { data: project } = await userClient
        .from("ugc_projects")
        .select("name, character_brief, tone, brand_notes")
        .eq("id", projectId)
        .maybeSingle();
      if (project) {
        const extra = [
          project.character_brief ? `Protagonista siempre igual: ${project.character_brief}.` : "",
          project.tone ? `Tono: ${project.tone}.` : "",
          project.brand_notes ? `Notas de marca: ${project.brand_notes}.` : "",
        ]
          .filter(Boolean)
          .join(" ");
        if (extra) prompt = `${prompt}\n\n${extra}`;
      }
    }

    // Imagen de partida: la que suben en el momento o la de la biblioteca de productos.
    let image = body?.image as { data?: string; mimeType?: string } | undefined;

    if (!image?.data && productId) {
      const { data: product } = await userClient
        .from("ugc_products")
        .select("name, description, image_path")
        .eq("id", productId)
        .maybeSingle();
      if (product) {
        const details = [product.name, product.description].filter(Boolean).join(" — ");
        if (details) prompt = `${prompt}\n\nProducto: ${details}.`;
        if (product.image_path) {
          const file = await admin.storage.from("ugc-products").download(product.image_path);
          if (file.data) {
            const bytes = new Uint8Array(await file.data.arrayBuffer());
            image = { data: toBase64(bytes), mimeType: file.data.type || "image/jpeg" };
          }
        }
      }
    }

    const hasImage = Boolean(image?.data && image?.mimeType);
    if (hasImage) {
      prompt = `${prompt}\n\nEncuadra la escena en formato ${aspectRatio} usando el producto de la imagen, aunque la foto tenga otra proporción.`;
    }

    const tokens = tokensForVideo(resolution, duration);

    // Cobro previo del consumo; si algo falla después se devuelve.
    const { data: balance, error: chargeError } = await admin.rpc("ugc_charge_tokens", {
      _user_id: user.id,
      _tokens: tokens,
      _reason: "video_generation",
    });
    if (chargeError) return json({ error: "No se pudo registrar el consumo de tokens." }, 500);
    if (balance === -1) {
      return json({ error: `Te faltan tokens: este vídeo cuesta ${tokens}. Recarga tu saldo para continuar.`, needTokens: tokens }, 402);
    }

    // Aviso al dueño cada 250 tokens consumidos en el mes, para recargar
    // los créditos de IA antes de quedarse sin margen de generación.
    creditsAlert(admin, tokens).catch((e) => console.error("credits alert", e));

    const refund = async () => {
      await admin.rpc("ugc_grant_tokens", {
        _user_id: user.id,
        _tokens: tokens,
        _reason: "video_refund",
      });
    };

    const input: unknown = hasImage
      ? [
          { type: "text", text: prompt },
          { type: "image", data: image!.data, mime_type: image!.mimeType },
        ]
      : prompt;

    const createRes = await fetch("https://ai.gateway.lovable.dev/v1/videos", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-omni-1.1-flash",
        input,
        response_format: {
          type: "video",
          resolution,
          duration: `${duration}s`,
          aspect_ratio: aspectRatio,
        },
      }),
    });

    if (!createRes.ok) {
      await refund();
      const err = await createRes.json().catch(() => null);
      const message =
        createRes.status === 402
          ? "No hay saldo de IA suficiente para generar el vídeo."
          : createRes.status === 429
            ? "Hay demasiados vídeos generándose ahora mismo. Prueba en un minuto."
            : (err?.message ?? "No se pudo iniciar la generación del vídeo.");
      return json({ error: message }, createRes.status);
    }

    const job = await createRes.json();

    const { data: row, error } = await userClient
      .from("ugc_videos")
      .insert({
        user_id: user.id,
        job_id: job.id,
        prompt,
        status: "in_progress",
        resolution,
        duration_seconds: duration,
        aspect_ratio: aspectRatio,
        has_start_image: hasImage,
        project_id: projectId,
        product_id: productId,
        tokens_charged: tokens,
      })
      .select()
      .single();

    if (error) {
      await refund();
      return json({ error: error.message }, 500);
    }

    return json({ video: row, tokensCharged: tokens, balance });
  } catch (e) {
    console.error("generate-ugc-video error", e);
    return json({ error: "Error inesperado al generar el vídeo." }, 500);
  }
});
