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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Inicia sesión para consultar tus vídeos." }, 401);

    const { id } = await req.json();
    if (!id) return json({ error: "Falta el identificador del vídeo." }, 400);

    const { data: row, error } = await userClient
      .from("ugc_videos")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!row) return json({ error: "Vídeo no encontrado." }, 404);

    const admin = createClient(supabaseUrl, serviceKey);

    const signed = async (path: string) => {
      const { data } = await admin.storage.from("ugc-videos").createSignedUrl(path, 3600);
      return data?.signedUrl ?? null;
    };

    if (row.status === "completed" && row.video_path) {
      return json({ video: row, url: await signed(row.video_path) });
    }
    if (row.status === "failed" || !row.job_id) {
      return json({ video: row, url: null });
    }

    const jobRes = await fetch(`https://ai.gateway.lovable.dev/v1/videos/${row.job_id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!jobRes.ok) {
      return json({ video: row, url: null });
    }
    const job = await jobRes.json();

    if (job.status === "failed") {
      const message = job?.error?.message ?? "La generación del vídeo ha fallado.";
      const { data: updated } = await userClient
        .from("ugc_videos")
        .update({ status: "failed", error_message: message })
        .eq("id", row.id)
        .select()
        .single();
      return json({ video: updated ?? row, url: null });
    }

    if (job.status !== "completed") {
      return json({ video: { ...row, progress: job.progress ?? null }, url: null });
    }

    const path = `${user.id}/${row.id}.mp4`;

    const existing = await admin.storage.from("ugc-videos").list(user.id, { search: `${row.id}.mp4` });
    if (!existing.data?.length) {
      const contentRes = await fetch(`https://ai.gateway.lovable.dev/v1/videos/${row.job_id}/content`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!contentRes.ok) return json({ video: row, url: null });
      const mp4 = await contentRes.arrayBuffer();
      const up = await admin.storage
        .from("ugc-videos")
        .upload(path, mp4, { contentType: "video/mp4", upsert: true });
      if (up.error) return json({ error: up.error.message }, 500);
    }

    const { data: updated } = await userClient
      .from("ugc_videos")
      .update({ status: "completed", video_path: path })
      .eq("id", row.id)
      .select()
      .single();

    return json({ video: updated ?? row, url: await signed(path) });
  } catch (e) {
    console.error("ugc-video-status error", e);
    return json({ error: "Error inesperado al consultar el vídeo." }, 500);
  }
});
