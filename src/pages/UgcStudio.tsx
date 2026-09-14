import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, X, Coins, Wand2 } from "lucide-react";
import ImageDropzone from "@/components/ugc/ImageDropzone";
import ProjectsPanel, { type UgcProject } from "@/components/ugc/ProjectsPanel";
import ProductsPanel, { type UgcProduct } from "@/components/ugc/ProductsPanel";
import VideoGallery, { type VideoRow } from "@/components/ugc/VideoGallery";
import TariffsPanel from "@/components/ugc/TariffsPanel";
import { eurFromTokens, formatEur, tokensForVideo } from "@/lib/ugcPricing";
import { UGC_PRESETS, getPreset } from "@/lib/ugcPresets";

const RESOLUTIONS = ["360p", "720p", "1080p"] as const;
const DURATIONS = [4, 6, 8, 10] as const;

const IDENTITY_NOTE =
  "Continuidad: aparece exactamente la misma persona de la imagen de referencia — misma cara, mismo pelo, mismo cuerpo y misma ropa — y habla con la misma voz, acento y tono que en la pieza anterior. No cambies de protagonista.";

// Extrae un fotograma del vídeo ya generado para usarlo como imagen de partida.
async function captureFrame(url: string): Promise<{ data: string; mimeType: string; preview: string }> {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.preload = "auto";
  video.src = url;

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("video load"));
  });

  await new Promise<void>((resolve, reject) => {
    video.onseeked = () => resolve();
    video.onerror = () => reject(new Error("video seek"));
    video.currentTime = Math.min(Math.max((video.duration || 4) * 0.35, 0.1), (video.duration || 4) - 0.1);
  });

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx || !canvas.width) throw new Error("no canvas");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  return { data: dataUrl.split(",")[1], mimeType: "image/jpeg", preview: dataUrl };
}

const Chip = ({
  active,
  children,
  ...rest
}: { active: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    {...rest}
    className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-40 ${
      active ? "border-primary/60 bg-primary/15 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

const UgcStudio = () => {
  const { toast } = useToast();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>("trial");

  const [idea, setIdea] = useState("");
  const [presetId, setPresetId] = useState<string>("cara");
  const [prompt, setPrompt] = useState("");
  const [assisting, setAssisting] = useState(false);
  const [resolution, setResolution] = useState<string>("720p");
  const [duration, setDuration] = useState<number>(8);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [image, setImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [keepingId, setKeepingId] = useState<string | null>(null);

  const [projects, setProjects] = useState<UgcProject[]>([]);
  const [products, setProducts] = useState<UgcProduct[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  

  const cost = tokensForVideo(resolution, duration);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/login?next=/ugc-studio";
        return;
      }
      setCheckingAuth(false);
    });
  }, []);

  const loadBalance = useCallback(async () => {
    const { data } = await supabase.from("ugc_token_accounts").select("balance_tokens, plan").maybeSingle();
    if (data) {
      setBalance(data.balance_tokens);
      setPlan(data.plan);
    } else {
      setBalance(0);
    }
  }, []);

  // Al volver del pago los tokens llegan unos segundos después: refrescamos el saldo varias veces.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;
    toast({
      title: "Pago recibido",
      description: "Estamos añadiendo tus tokens, se reflejarán en unos segundos.",
    });
    window.history.replaceState({}, "", "/ugc-studio");
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      loadBalance();
      if (attempts >= 6) window.clearInterval(timer);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [loadBalance, toast]);

  const loadProjects = useCallback(async () => {
    const { data } = await supabase.from("ugc_projects").select("id, name, character_brief, tone, brand_notes, reference_image_path").order("created_at", { ascending: false });
    setProjects((data ?? []) as UgcProject[]);
  }, []);

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from("ugc_products").select("id, name, description, image_path").order("created_at", { ascending: false });
    setProducts((data ?? []) as UgcProduct[]);
  }, []);

  const loadUrl = useCallback(async (row: VideoRow) => {
    if (!row.video_path) return;
    const { data } = await supabase.storage.from("ugc-videos").createSignedUrl(row.video_path, 3600);
    if (data?.signedUrl) setUrls((prev) => ({ ...prev, [row.id]: data.signedUrl }));
  }, []);

  const loadVideos = useCallback(async () => {
    const { data } = await supabase.from("ugc_videos").select("*").order("created_at", { ascending: false }).limit(30);
    const rows = (data ?? []) as VideoRow[];
    setVideos(rows);
    rows.filter((r) => r.status === "completed" && r.video_path).forEach(loadUrl);
  }, [loadUrl]);

  useEffect(() => {
    if (checkingAuth) return;
    loadBalance();
    loadProjects();
    loadProducts();
    loadVideos();
  }, [checkingAuth, loadBalance, loadProjects, loadProducts, loadVideos]);

  // Consulta el estado de los vídeos que aún se están generando.
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
          loadBalance();
          toast({
            title: "El vídeo no se pudo generar",
            description: `${updated.error_message ?? "Prueba a cambiar la descripción."} Te hemos devuelto los tokens.`,
            variant: "destructive",
          });
        }
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [videos, toast, loadBalance]);

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

  // Al elegir un proyecto con imagen de referencia, la usamos como punto de partida si no hay otra.
  async function selectProject(p: UgcProject | null) {
    setProjectId(p?.id ?? null);
    if (!p?.reference_image_path || image) return;
    const { data } = await supabase.storage.from("ugc-products").createSignedUrl(p.reference_image_path, 3600);
    if (!data?.signedUrl) return;
    try {
      const blob = await (await fetch(data.signedUrl)).blob();
      await pickImage(new File([blob], "referencia.jpg", { type: blob.type || "image/jpeg" }));
      toast({ title: "Personaje del proyecto cargado", description: "Usaremos su imagen de referencia en este vídeo." });
    } catch {
      /* si falla, el usuario puede arrastrar la imagen a mano */
    }
  }


  // Reutiliza el guion y los ajustes de un vídeo anterior para editarlo y volver a generarlo.
  function reuseVideo(v: VideoRow) {
    setPrompt(v.prompt);
    setResolution(v.resolution);
    setDuration(Number(v.duration_seconds) || 8);
    setAspectRatio(v.aspect_ratio === "16:9" ? "16:9" : "9:16");
    if (v.project_id !== undefined) setProjectId(v.project_id ?? null);
    if (v.product_id !== undefined) setProductId(v.product_id ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast({ title: "Guion cargado", description: "Edítalo y genera una variante con los mismos ajustes." });
  }

  // Toma un fotograma del vídeo anterior como referencia para conservar cara, cuerpo y voz.
  async function keepIdentity(v: VideoRow) {
    const url = urls[v.id];
    if (!url) {
      toast({ title: "El vídeo aún no está listo", variant: "destructive" });
      return;
    }
    setKeepingId(v.id);
    try {
      const frame = await captureFrame(url);
      setImage(frame);
      setPrompt((prev) => {
        const base = (prev.trim() || v.prompt).replace(IDENTITY_NOTE, "").trim();
        return `${base}\n\n${IDENTITY_NOTE}`;
      });
      if (v.project_id !== undefined) setProjectId(v.project_id ?? null);
      if (v.product_id !== undefined) setProductId(v.product_id ?? null);
      setAspectRatio(v.aspect_ratio === "16:9" ? "16:9" : "9:16");
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast({
        title: "Personaje fijado",
        description: "Usaremos un fotograma de ese vídeo para mantener la misma cara, cuerpo y voz.",
      });
    } catch {
      toast({
        title: "No se pudo tomar la imagen",
        description: "Descarga el vídeo, haz una captura y súbela como foto de partida.",
        variant: "destructive",
      });
    } finally {
      setKeepingId(null);
    }
  }

  async function writeWithAssistant() {
    const seed = idea.trim() || prompt.trim();
    if (seed.length < 3) {
      toast({ title: "Cuéntame la idea", description: "Una frase basta: “chica probando el sérum en el baño”.", variant: "destructive" });
      return;
    }
    setAssisting(true);
    const { data, error } = await supabase.functions.invoke("ugc-prompt", {
      body: {
        idea: seed,
        presetId,
        projectId,
        productId,
        aspectRatio,
        duration,
        hasImage: Boolean(image || productId),
      },
    });
    setAssisting(false);
    const message = (data as { error?: string } | null)?.error;
    if (error || message || !data?.prompt) {
      toast({ title: "El asistente no ha podido escribirlo", description: message ?? error?.message ?? "Prueba otra vez.", variant: "destructive" });
      return;
    }
    setPrompt(data.prompt);
    toast({ title: "Guion listo", description: "Revísalo y ajusta lo que quieras antes de generar." });
  }

  async function generate() {
    if (prompt.trim().length < 5) {
      toast({ title: "Falta la descripción", description: "Usa el asistente o escribe qué debe pasar.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("generate-ugc-video", {
      body: {
        prompt,
        presetId,
        resolution,
        duration,
        aspectRatio,
        projectId,
        productId,
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
      loadBalance();
      return;
    }
    toast({ title: "Vídeo en cola", description: `Tarda entre 1 y 3 minutos. Has usado ${data.tokensCharged} tokens.` });
    setVideos((prev) => [data.video as VideoRow, ...prev]);
    if (typeof data.balance === "number") setBalance(data.balance);
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const lowBalance = balance !== null && balance < cost;

  return (
    <>
      <Helmet>
        <title>Estudio UGC con IA — TikShopTok</title>
        <meta name="description" content="Herramienta interna de TikShopTok para generar vídeos UGC con IA." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-32 md:px-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Estudio UGC
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Vídeos UGC con IA, listos para TikTok Shop
            </h1>
            <p className="mt-3 text-muted-foreground">
              Crea proyectos con un personaje fijo, guarda tus productos y genera piezas verticales u horizontales con el
              mismo estilo. El asistente escribe el guion por ti.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl md:min-w-[220px]">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Coins className="h-3.5 w-3.5 text-primary" /> Saldo
            </p>
            <p className="mt-2 font-display text-3xl font-bold">{balance ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              tokens · equivale a {formatEur(eurFromTokens(balance ?? 0))} · plan {plan}
            </p>
          </div>
        </header>

        <Tabs defaultValue="generar" className="mt-10">
          <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card/60">
            <TabsTrigger value="generar">Generar</TabsTrigger>
            <TabsTrigger value="proyectos">Proyectos ({projects.length})</TabsTrigger>
            <TabsTrigger value="productos">Productos ({products.length})</TabsTrigger>
            <TabsTrigger value="tarifas">Tarifas</TabsTrigger>
          </TabsList>

          <TabsContent value="generar" className="mt-8">
            <section className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
              <div className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
                {(projects.length > 0 || products.length > 0) && (
                  <div className="space-y-4">
                    {projects.length > 0 && (
                      <div className="space-y-2">
                        <Label>Proyecto</Label>
                        <div className="flex flex-wrap gap-2">
                          <Chip active={projectId === null} onClick={() => selectProject(null)}>
                            Sin proyecto
                          </Chip>
                          {projects.map((p) => (
                            <Chip key={p.id} active={projectId === p.id} onClick={() => selectProject(p)}>
                              {p.name}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                    {products.length > 0 && (
                      <div className="space-y-2">
                        <Label>Producto</Label>
                        <div className="flex flex-wrap gap-2">
                          <Chip active={productId === null} onClick={() => setProductId(null)}>
                            Ninguno
                          </Chip>
                          {products.map((p) => (
                            <Chip key={p.id} active={productId === p.id} onClick={() => setProductId(p.id)}>
                              {p.name}
                            </Chip>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          La foto guardada se reencuadra al formato que elijas.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 space-y-2">
                  <Label>Estilo del vídeo</Label>
                  <div className="flex flex-wrap gap-2">
                    {UGC_PRESETS.map((p) => (
                      <Chip
                        key={p.id}
                        active={presetId === p.id}
                        onClick={() => {
                          setPresetId(p.id);
                          if (p.aspectRatio) setAspectRatio(p.aspectRatio);
                        }}
                      >
                        {p.label}
                      </Chip>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{getPreset(presetId)?.hint}</p>
                </div>

                <div className="mt-6 space-y-2">
                  <Label htmlFor="idea">Tu idea en una frase</Label>
                  <div className="flex gap-2">
                    <Input
                      id="idea"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Chica probando el sérum antes de salir"
                    />
                    <Button variant="outline" className="shrink-0 rounded-full" onClick={writeWithAssistant} disabled={assisting}>
                      {assisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                      <span className="ml-2 hidden sm:inline">Escribir guion</span>
                    </Button>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <Label htmlFor="prompt">Guion del vídeo</Label>
                  <Textarea
                    id="prompt"
                    rows={7}
                    placeholder="El asistente lo rellena por ti, o escríbelo tú: encuadre, luz, tono, qué dice…"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Formato</Label>
                    <div className="flex gap-2">
                      {(["9:16", "16:9"] as const).map((r) => (
                        <Chip key={r} active={aspectRatio === r} onClick={() => setAspectRatio(r)}>
                          {r}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Duración</Label>
                    <div className="flex flex-wrap gap-2">
                      {DURATIONS.map((d) => (
                        <Chip key={d} active={duration === d} onClick={() => setDuration(d)}>
                          {d}s
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Calidad</Label>
                    <div className="flex flex-wrap gap-2">
                      {RESOLUTIONS.map((r) => (
                        <Chip key={r} active={resolution === r} onClick={() => setResolution(r)}>
                          {r}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Label>Imagen de referencia (opcional)</Label>
                  {image ? (
                    <div className="flex items-center gap-3">
                      <img src={image.preview} alt="Imagen de referencia" className="h-20 w-20 rounded-xl object-cover" />
                      <Button variant="ghost" size="sm" onClick={() => setImage(null)}>
                        <X className="mr-1 h-4 w-4" /> Quitar
                      </Button>
                    </div>
                  ) : (
                    <ImageDropzone
                      title="Arrastra tu imagen de referencia"
                      hint="cara, producto o fotograma · o haz clic para elegirla"
                      onFiles={(files) => pickImage(files[0])}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    El vídeo partirá de esta imagen, junto con el guion y el proyecto o producto que elijas.
                  </p>
                </div>

                <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/10 bg-background/40 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Coste de este vídeo</span>
                  <span className="font-medium">
                    {cost} tokens · {formatEur(eurFromTokens(cost))}
                  </span>
                </div>

                <Button onClick={generate} disabled={busy || lowBalance} className="mt-4 w-full rounded-full">
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {busy ? "Enviando…" : "Generar vídeo"}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  {lowBalance
                    ? "No te quedan tokens suficientes. Recarga desde la pestaña Tarifas."
                    : "Cada vídeo tarda 1–3 minutos. Si falla, te devolvemos los tokens."}
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">Tus vídeos</h2>
                <div className="mt-4">
                  <VideoGallery
                    videos={videos}
                    urls={urls}
                    onReuse={reuseVideo}
                    onKeepIdentity={keepIdentity}
                    keepingId={keepingId}
                  />
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="proyectos" className="mt-8">
            <ProjectsPanel projects={projects} onChanged={loadProjects} />
          </TabsContent>

          <TabsContent value="productos" className="mt-8">
            <ProductsPanel products={products} onChanged={loadProducts} />
          </TabsContent>

          <TabsContent value="tarifas" className="mt-8">
            <TariffsPanel
              onPick={(label) =>
                toast({
                  title: `${label} seleccionado`,
                  description: "El pago con tarjeta se activa en el siguiente paso; mientras tanto te lo asignamos a mano.",
                })
              }
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </>
  );
};

export default UgcStudio;
