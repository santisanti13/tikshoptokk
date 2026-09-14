import { createClient } from "npm:@supabase/supabase-js@2";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "Falta la configuración de IA." }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Inicia sesión para generar vídeos." }, 401);

    const body = await req.json();
    const prompt = String(body?.prompt ?? "").trim();
    if (prompt.length < 5) return json({ error: "Describe el vídeo con un poco más de detalle." }, 400);

    const resolution = ["360p", "720p", "1080p"].includes(body?.resolution) ? body.resolution : "720p";
    const durationRaw = Number(body?.duration ?? 8);
    const duration = Math.min(Math.max(Math.round(durationRaw) || 8, 3), 10);
    const aspectRatio = body?.aspectRatio === "16:9" ? "16:9" : "9:16";
    const image = body?.image as { data?: string; mimeType?: string } | undefined;
    const hasImage = Boolean(image?.data && image?.mimeType);

    const input: unknown = hasImage
      ? [
          { type: "text", text: prompt },
          { type: "image", data: image!.data, mime_type: image!.mimeType },
        ]
      : prompt;

    const responseFormat: Record<string, unknown> = {
      type: "video",
      resolution,
      duration: `${duration}s`,
    };
    if (!hasImage) responseFormat.aspect_ratio = aspectRatio;

    const createRes = await fetch("https://ai.gateway.lovable.dev/v1/videos", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-omni-1.1-flash",
        input,
        response_format: responseFormat,
      }),
    });

    if (!createRes.ok) {
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
        aspect_ratio: hasImage ? null : aspectRatio,
        has_start_image: hasImage,
      })
      .select()
      .single();

    if (error) return json({ error: error.message }, 500);

    return json({ video: row });
  } catch (e) {
    console.error("generate-ugc-video error", e);
    return json({ error: "Error inesperado al generar el vídeo." }, 500);
  }
});
