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

const SYSTEM = `Eres director creativo de vídeo UGC para TikTok Shop.
Escribes prompts en español para el modelo de vídeo de Google (gemini-omni).
Reglas obligatorias:
- Una sola escena, un solo momento. Nada de secuencias con varios sitios.
- Describe encuadre, cámara (móvil en mano, plano cercano), luz, tono y ritmo.
- Estilo casero y creíble, nunca publicitario ni de estudio.
- Indica el audio en lenguaje natural (voz cercana, ambiente, música suave).
- Si hay diálogo, escríbelo con dos puntos tras el hablante y sin comillas.
- Si el vídeo parte de una foto de producto, describe solo el movimiento y no repitas el aspecto del producto.
- Añade "Plano continuo, sin cortes de escena." al final.
- Devuelve SOLO el prompt final, sin títulos ni explicaciones, entre 60 y 130 palabras.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "Falta la configuración de IA." }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return json({ error: "Inicia sesión para usar el asistente." }, 401);

    const body = await req.json();
    const idea = String(body?.idea ?? "").trim();
    if (idea.length < 3) return json({ error: "Cuéntanos la idea en una frase." }, 400);

    const aspectRatio = body?.aspectRatio === "16:9" ? "16:9" : "9:16";
    const duration = Math.min(Math.max(Math.round(Number(body?.duration ?? 8)) || 8, 3), 10);
    const hasImage = Boolean(body?.hasImage);

    const context: string[] = [`Idea: ${idea}`, `Formato: ${aspectRatio}`, `Duración: ${duration} segundos`];
    if (hasImage) context.push("El vídeo parte de una foto de producto que ya define el aspecto del producto.");

    if (body?.projectId) {
      const { data: project } = await userClient
        .from("ugc_projects")
        .select("name, character_brief, tone, brand_notes")
        .eq("id", body.projectId)
        .maybeSingle();
      if (project) {
        context.push(`Proyecto: ${project.name}`);
        if (project.character_brief) context.push(`Personaje fijo (descríbelo igual siempre): ${project.character_brief}`);
        if (project.tone) context.push(`Tono: ${project.tone}`);
        if (project.brand_notes) context.push(`Notas de marca: ${project.brand_notes}`);
      }
    }

    if (body?.productId) {
      const { data: product } = await userClient
        .from("ugc_products")
        .select("name, description")
        .eq("id", body.productId)
        .maybeSingle();
      if (product) {
        context.push(`Producto: ${product.name}`);
        if (product.description) context.push(`Detalles del producto: ${product.description}`);
      }
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: context.join("\n") },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      const message =
        res.status === 402
          ? "No hay saldo de IA suficiente para el asistente."
          : res.status === 429
            ? "El asistente está saturado. Prueba en unos segundos."
            : (err?.message ?? "El asistente no ha podido responder.");
      return json({ error: message }, res.status);
    }

    const data = await res.json();
    const prompt = String(data?.choices?.[0]?.message?.content ?? "").trim();
    if (!prompt) return json({ error: "El asistente no ha podido responder." }, 502);

    return json({ prompt });
  } catch (e) {
    console.error("ugc-prompt-assistant error", e);
    return json({ error: "Error inesperado en el asistente." }, 500);
  }
});
