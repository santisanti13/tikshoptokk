import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Download, ImagePlus, X } from "lucide-react";

type VideoRow = {
  id: string;
  prompt: string;
  status: string;
  error_message: string | null;
  resolution: string;
  duration_seconds: number;
  aspect_ratio: string | null;
  video_path: string | null;
  created_at: string;
};

const RESOLUTIONS = ["360p", "720p", "1080p"] as const;
const DURATIONS = [4, 6, 8, 10] as const;

const IDEAS = [
  "Una chica joven graba con el móvil en su habitación mientras abre la caja de una crema facial y la aplica; habla a cámara con entusiasmo natural, luz de ventana, estilo UGC vertical.",
  "Primer plano de unas manos sacando una botella de agua térmica de una mochila en el gimnasio; voz en off cercana explicando por qué la lleva siempre, estilo vídeo casero.",
  "Un chico en la cocina prepara un batido con el vaso mezclador, lo enseña a cámara y sonríe; iluminación cálida, sonido ambiente de cocina y música suave.",
];

const UgcStudio = () => {
  const { toast } = useToast();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [resolution, setResolution] = useState<string>("720p");
  const [duration, setDuration] = useState<number>(8);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [image, setImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/login?next=/ugc-studio";
        return;
      }
      setCheckingAuth(false);
    });
  }, []);

  const loadUrl = useCallback(async (row: VideoRow) => {
    if (!row.video_path) return;
    const { data } = await supabase.storage.from("ugc-videos").createSignedUrl(row.video_path, 3600);
    if (data?.signedUrl) setUrls((prev) => ({ ...prev, [row.id]: data.signedUrl }));
  }, []);

  const loadVideos = useCallback(async () => {
    const { data } = await supabase
      .from("ugc_videos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    const rows = (data ?? []) as VideoRow[];
    setVideos(rows);
    rows.filter((r) => r.status === "completed" && r.video_path).forEach(loadUrl);
  }, [loadUrl]);

  useEffect(() => {
    if (!checkingAuth) loadVideos();
  }, [checkingAuth, loadVideos]);

  // Poll unfinished videos
  useEffect(() => {
    const pending = videos.filter((v) => v.status !== "completed" && v.status !== "failed");
    if (pending.length === 0) return;
    const timer = setTimeout(async () => {
      for (const v of pending) {
        const { data, error } = await supabase.functions.invoke("ugc-video-status", { body: { id: v.id } });
        if (error) continue;
        const updated = data?.video as VideoRow | undefined;
        if (!updated) continue;
        setVideos((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)));
        if (data?.url) setUrls((prev) => ({ ...prev, [updated.id]: data.url }));
        if (updated.status === "failed") {
          toast({
            title: "El vídeo no se pudo generar",
            description: updated.error_message ?? "Prueba a cambiar la descripción.",
            variant: "destructive",
          });
        }
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [videos, toast]);

  async function pickImage(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Imagen demasiado grande", description: "Usa una foto de menos de 8 MB.", variant: "destructive" });
      return;
    }
    const buffer = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    setImage({ data: btoa(binary), mimeType: file.type, preview: URL.createObjectURL(file) });
  }

  async function generate() {
    if (prompt.trim().length < 5) {
      toast({ title: "Falta la descripción", description: "Cuéntanos qué debe pasar en el vídeo.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("generate-ugc-video", {
      body: {
        prompt,
        resolution,
        duration,
        aspectRatio,
        ...(image ? { image: { data: image.data, mimeType: image.mimeType } } : {}),
      },
    });
    setBusy(false);

    const message = (data as { error?: string } | null)?.error;
    if (error || message) {
      toast({
        title: "No se pudo iniciar el vídeo",
        description: message ?? error?.message ?? "Inténtalo de nuevo en un momento.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Vídeo en cola", description: "Tarda entre 1 y 3 minutos. Se actualiza solo." });
    setVideos((prev) => [data.video as VideoRow, ...prev]);
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>Estudio UGC con IA — TikShopTok</title>
        <meta name="description" content="Herramienta interna de TikShopTok para generar vídeos UGC con IA." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-32 md:px-8">
        <header className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Herramienta interna
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Estudio de vídeos UGC con IA
          </h1>
          <p className="mt-3 text-muted-foreground">
            Describe la escena, elige formato y duración, y genera piezas verticales listas para TikTok Shop. Puedes
            partir de una foto de producto.
          </p>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
            <div className="space-y-2">
              <Label htmlFor="prompt">Qué debe pasar en el vídeo</Label>
              <Textarea
                id="prompt"
                rows={6}
                placeholder="Una chica muestra el producto a cámara en su habitación, luz natural, tono cercano…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {IDEAS.map((idea, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(idea)}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Idea {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Formato</Label>
                <div className="flex gap-2">
                  {(["9:16", "16:9"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      disabled={Boolean(image)}
                      onClick={() => setAspectRatio(r)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-40 ${
                        aspectRatio === r && !image
                          ? "border-primary/60 bg-primary/15 text-foreground"
                          : "border-white/10 text-muted-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {image && <p className="text-xs text-muted-foreground">Se toma de la foto.</p>}
              </div>

              <div className="space-y-2">
                <Label>Duración</Label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        duration === d
                          ? "border-primary/60 bg-primary/15 text-foreground"
                          : "border-white/10 text-muted-foreground"
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Calidad</Label>
                <div className="flex flex-wrap gap-2">
                  {RESOLUTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setResolution(r)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        resolution === r
                          ? "border-primary/60 bg-primary/15 text-foreground"
                          : "border-white/10 text-muted-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">360p para pruebas rápidas y baratas.</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label>Foto de producto (opcional)</Label>
              {image ? (
                <div className="flex items-center gap-3">
                  <img src={image.preview} alt="Foto de partida" className="h-20 w-20 rounded-xl object-cover" />
                  <Button variant="ghost" size="sm" onClick={() => setImage(null)}>
                    <X className="mr-1 h-4 w-4" /> Quitar
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => fileRef.current?.click()}>
                  <ImagePlus className="mr-2 h-4 w-4" /> Subir foto
                </Button>
              )}
              <Input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) pickImage(file);
                  e.target.value = "";
                }}
              />
            </div>

            <Button onClick={generate} disabled={busy} className="mt-7 w-full rounded-full">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {busy ? "Enviando…" : "Generar vídeo"}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Cada vídeo tarda 1–3 minutos y consume créditos de IA. Genera de uno en uno.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Tus vídeos</h2>
            <div className="mt-4 space-y-4">
              {videos.length === 0 && (
                <p className="text-sm text-muted-foreground">Todavía no has generado ningún vídeo.</p>
              )}
              {videos.map((v) => (
                <div key={v.id} className="rounded-3xl border border-white/10 bg-card/60 p-4 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{v.prompt}</p>
                    <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-muted-foreground">
                      {v.status === "completed" ? "Listo" : v.status === "failed" ? "Error" : "Generando…"}
                    </span>
                  </div>

                  {v.status === "completed" && urls[v.id] && (
                    <>
                      <video
                        src={urls[v.id]}
                        controls
                        loop
                        playsInline
                        className={`mt-3 w-full rounded-2xl bg-black ${
                          v.aspect_ratio === "16:9" ? "aspect-video" : "aspect-[9/16] max-w-[260px]"
                        }`}
                      />
                      <Button asChild variant="outline" size="sm" className="mt-3 rounded-full">
                        <a href={urls[v.id]} download={`ugc-${v.id}.mp4`}>
                          <Download className="mr-2 h-4 w-4" /> Descargar
                        </a>
                      </Button>
                    </>
                  )}

                  {v.status !== "completed" && v.status !== "failed" && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Trabajando en tu vídeo…
                    </div>
                  )}

                  {v.status === "failed" && (
                    <p className="mt-3 text-sm text-destructive">{v.error_message ?? "No se pudo generar."}</p>
                  )}

                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {new Date(v.created_at).toLocaleString("es-ES")} · {v.resolution} · {v.duration_seconds}s
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default UgcStudio;
