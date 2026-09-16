import { createClient } from "npm:@supabase/supabase-js@2";
import { tokensForVideo } from "../_shared/ugcPricing.ts";
import { getPreset } from "../_shared/ugcPresets.ts";
import { blindSpotsBlock } from "../_shared/ugcBlindSpots.ts";
import { complianceBlock } from "../_shared/ugcCompliance.ts";
import { POLICY_BLOCK, STYLE_REFERENCE_BLOCK, checkPolicy, hasBlocking } from "../_shared/ugcPolicy.ts";

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

const ALERT_STEP_TOKENS = 250;
const OWNER_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") ?? "santiagojimenezvalero@gmail.com";

/**
 * Avisa al dueño cada ALERT_STEP_TOKENS consumidos en el mes en curso para que
 * recargue créditos de IA antes de agotarlos. Idempotente vía payment_events.
 */
async function creditsAlert(
  admin: ReturnType<typeof createClient>,
  tokensJustCharged: number,
) {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { data, error } = await admin
    .from("ugc_token_ledger")
    .select("delta_tokens")
    .lt("delta_tokens", 0)
    .gte("created_at", monthStart.toISOString());
  if (error || !data) return;

  const consumed = data.reduce((sum, r: { delta_tokens: number }) => sum + Math.abs(r.delta_tokens), 0);
  const bucket = Math.floor(consumed / ALERT_STEP_TOKENS);
  if (bucket === 0) return;
  if (Math.floor((consumed - tokensJustCharged) / ALERT_STEP_TOKENS) === bucket) return;

  const eventKey = `ai_credits_alert:${monthStart.toISOString().slice(0, 7)}:${bucket}`;
  const { error: claimError } = await admin.from("payment_events").insert({ event_key: eventKey });
  if (claimError) return; // ya avisado

  const { sendTemplateEmail } = await import("../_shared/transactional-email-templates/send-email.ts");
  const { logEmailSend } = await import("../_shared/emailLog.ts");
  try {
    const result = await sendTemplateEmail("payment-notification", OWNER_EMAIL, {
      templateData: {
        headline: "Recarga de créditos de IA",
        planName: "Estudio UGC",
        amountLabel: `${consumed} tokens consumidos este mes`,
        detail:
          `El estudio ha consumido ${consumed} tokens en el mes en curso. ` +
          `Revisa el saldo de créditos de IA del workspace y recárgalo para que las generaciones no se detengan.`,
      },
      idempotencyKey: `${eventKey}-${crypto.randomUUID()}`,
    });
    await logEmailSend({
      templateName: "payment-notification",
      recipientEmail: OWNER_EMAIL,
      status: result.sent ? "sent" : "suppressed",
    });
  } catch (e) {
    await logEmailSend({
      templateName: "payment-notification",
      recipientEmail: OWNER_EMAIL,
      status: "failed",
      errorMessage: e instanceof Error ? e.message : String(e),
    });
  }
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

    // Normas de TikTok Shop: no se genera (ni se cobra) nada que pueda sancionar la cuenta.
    const issues = checkPolicy(prompt);
    if (hasBlocking(issues)) {
      const blocking = issues.filter((i) => i.level === "block");
      return json(
        {
          error: `El guion incumple las normas de TikTok Shop: ${blocking.map((i) => i.title.toLowerCase()).join("; ")}. ${blocking[0].fix}`,
          policyIssues: blocking,
        },
        400,
      );
    }

    let resolution = ["360p", "720p", "1080p"].includes(body?.resolution) ? body.resolution : "720p";
    const durationRaw = Number(body?.duration ?? 8);
    const duration = Math.min(Math.max(Math.round(durationRaw) || 8, 3), 10);
    let aspectRatio = body?.aspectRatio === "16:9" ? "16:9" : "9:16";
    const projectId = typeof body?.projectId === "string" ? body.projectId : null;
    const productId = typeof body?.productId === "string" ? body.productId : null;
    const referenceUrl = typeof body?.sourceUrl === "string" && /tiktok\.com/i.test(body.sourceUrl) ? body.sourceUrl : null;
    // Referencia de estilo de un vídeo de TikTok: forma sí, personas nunca.
    const styleReference = typeof body?.styleReference === "string" ? body.styleReference.trim().slice(0, 600) : "";

    // Continuación: alarga un vídeo ya generado añadiéndole segundos nuevos.
    const extendFromId = typeof body?.extendFromVideoId === "string" ? body.extendFromVideoId : null;
    let sourceVideo: {
      id: string;
      resolution: string;
      aspect_ratio: string | null;
      duration_seconds: number;
      video_path: string | null;
      status: string;
    } | null = null;
    let sourceBase64: string | null = null;

    const MAX_TOTAL_SECONDS = 50;

    if (extendFromId) {
      const { data: src } = await userClient
        .from("ugc_videos")
        .select("id, resolution, aspect_ratio, duration_seconds, video_path, status")
        .eq("id", extendFromId)
        .maybeSingle();
      if (!src || src.status !== "completed" || !src.video_path) {
        return json({ error: "El vídeo que quieres alargar no está listo todavía." }, 400);
      }
      if (Number(src.duration_seconds) + duration > MAX_TOTAL_SECONDS) {
        return json(
          {
            error: `El máximo es ${MAX_TOTAL_SECONDS} segundos por vídeo. Este ya dura ${src.duration_seconds}s: puedes añadir hasta ${Math.max(0, MAX_TOTAL_SECONDS - Number(src.duration_seconds))}s.`,
          },
          400,
        );
      }
      const file = await admin.storage.from("ugc-videos").download(src.video_path);
      if (!file.data) return json({ error: "No se pudo leer el vídeo original." }, 500);
      const bytes = new Uint8Array(await file.data.arrayBuffer());
      if (bytes.length > 40 * 1024 * 1024) {
        return json(
          { error: "El vídeo pesa demasiado para alargarlo más. Prueba con una calidad menor o descárgalo y únelo por tu cuenta." },
          400,
        );
      }
      sourceVideo = src as typeof sourceVideo;
      sourceBase64 = toBase64(bytes);
      resolution = src.resolution;
      aspectRatio = src.aspect_ratio === "16:9" ? "16:9" : "9:16";
    }

    // Preset de estilo: fija cámara, luz y audio del formato elegido.
    const preset = getPreset(typeof body?.presetId === "string" ? body.presetId : null);
    if (preset) prompt = `${prompt}\n\n${preset.recipe}`;

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

    // Imágenes de referencia que manda el estudio: la primera es el punto de partida.
    // En una continuación no se usa imagen: el punto de partida es el vídeo anterior.
    const sent = Array.isArray(body?.images)
      ? (body.images as { data?: string; mimeType?: string }[])
          .filter((i) => typeof i?.data === "string" && typeof i?.mimeType === "string")
          .slice(0, 4)
      : [];
    let image = sourceVideo
      ? undefined
      : ((body?.image as { data?: string; mimeType?: string } | undefined) ?? sent[0]);
    // Referencias extra: el resto de imágenes del usuario y las vistas del 3D del producto.
    const extraImages: { data: string; mimeType: string }[] = [];
    const userRefs = sourceVideo ? 0 : sent.length - 1;
    if (userRefs > 0) {
      for (const ref of sent.slice(1)) extraImages.push({ data: ref.data!, mimeType: ref.mimeType! });
      prompt =
        `${prompt}\n\nHay ${userRefs} imagen(es) de referencia adicionales del mismo producto, personaje o escenario: ` +
        `respeta la forma, el color, el acabado y los detalles que muestran. No las copies como plano ni reproduzcas su fondo.`;
    }

    if (productId) {
      const { data: product } = await userClient
        .from("ugc_products")
        .select("name, description, image_path, blind_spots, render_paths")
        .eq("id", productId)
        .maybeSingle();
      if (product) {
        const details = [product.name, product.description].filter(Boolean).join(" — ");
        if (details) prompt = `${prompt}\n\nProducto: ${details}.`;
        const blind = blindSpotsBlock(product.blind_spots as string | null);
        if (blind) prompt = `${prompt}\n\n${blind}`;
        // Reglas por categoría (salud, cosmética, infantil…) para no arriesgar la cuenta.
        const rules = complianceBlock(`${details} ${product.blind_spots ?? ""}`);
        if (rules) prompt = `${prompt}\n\n${rules}`;


        if (!sourceVideo && !image?.data && product.image_path) {
          const file = await admin.storage.from("ugc-products").download(product.image_path);
          if (file.data) {
            const bytes = new Uint8Array(await file.data.arrayBuffer());
            image = { data: toBase64(bytes), mimeType: file.data.type || "image/jpeg" };
          }
        }

        // Vistas del 3D, sin pasar de 5 referencias en total para no inflar el cuerpo.
        const room = Math.max(0, 5 - extraImages.length);
        const renders = Array.isArray(product.render_paths) ? (product.render_paths as string[]).slice(0, room) : [];
        if (!sourceVideo && renders.length > 0) {
          let added = 0;
          for (const path of renders) {
            const file = await admin.storage.from("ugc-products").download(path);
            if (!file.data) continue;
            const bytes = new Uint8Array(await file.data.arrayBuffer());
            extraImages.push({ data: toBase64(bytes), mimeType: file.data.type || "image/jpeg" });
            added += 1;
          }
          if (added > 0) {
            prompt =
              `${prompt}\n\nLas últimas ${added} imágenes son vistas del mismo producto desde otros ángulos ` +
              `(render de su modelo 3D, sobre fondo gris): la forma, las proporciones, el color y el acabado del producto ` +
              `deben coincidir exactamente con ellas en todo el vídeo. No copies el fondo gris ni el estilo de render.`;
          }
        }
      }
    }

    if (sourceVideo) {
      prompt =
        `${prompt}\n\nLa escena continúa exactamente desde donde termina el vídeo adjunto: misma persona, misma ropa, misma luz, mismo sitio y misma voz. ` +
        `El audio sigue sin corte. No repitas lo que ya ha pasado.`;
    }

    const hasImage = Boolean(image?.data && image?.mimeType);
    if (hasImage) {
      prompt = `${prompt}\n\nEncuadra la escena en formato ${aspectRatio} usando el producto de la imagen, aunque la foto tenga otra proporción.`;
    }

    // Nota de seguridad: el modelo rechaza escenas que parezcan una persona real
    // identificable. Se declara explícitamente que el personaje es ficticio.
    prompt =
      `${prompt}\n\nPersonaje: figurante ficticio y anónimo creado para este anuncio, sin parecido con ninguna persona real, ` +
      `pública o famosa, y con consentimiento para aparecer. Contenido comercial apto para todos los públicos: sin afirmaciones ` +
      `médicas, sin menores, sin contenido sensible y sin texto sobreimpreso.`;

    // Estilo de un vídeo de referencia: gancho, luz, cámara y cómo se muestra el producto, nunca la persona.
    if (!sourceVideo && styleReference) {
      prompt = `${prompt}\n\n${STYLE_REFERENCE_BLOCK}\nVídeo de referencia: ${styleReference}`;
    }

    // Normas de TikTok Shop, siempre al final para que pesen sobre todo lo anterior.
    prompt = `${prompt}\n\n${POLICY_BLOCK}`;

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

    const input: unknown = sourceVideo
      ? [
          { type: "text", text: prompt },
          { type: "video", data: sourceBase64, mime_type: "video/mp4" },
        ]
      : hasImage
        ? [
            { type: "text", text: prompt },
            { type: "image", data: image!.data, mime_type: image!.mimeType },
            ...extraImages.map((img) => ({ type: "image", data: img.data, mime_type: img.mimeType })),
          ]
        : extraImages.length > 0
          ? [
              { type: "text", text: prompt },
              ...extraImages.map((img) => ({ type: "image", data: img.data, mime_type: img.mimeType })),
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
          // En una continuación el formato lo hereda del vídeo original y el
          // proveedor rechaza el aspect_ratio explícito.
          ...(sourceVideo ? {} : { aspect_ratio: aspectRatio }),
        },
        ...(sourceVideo ? { generation_config: { video_config: { task: "extend" } } } : {}),
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
        duration_seconds: sourceVideo ? Number(sourceVideo.duration_seconds) + duration : duration,
        aspect_ratio: aspectRatio,
        has_start_image: hasImage,
        source_video_id: sourceVideo?.id ?? null,
        added_seconds: sourceVideo ? duration : null,
        project_id: projectId,
        product_id: productId,
        source_url: referenceUrl,
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
