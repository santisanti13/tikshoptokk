import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import StudioShell from "@/components/ugc/StudioShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, X, Coins, Wand2 } from "lucide-react";
import ImageDropzone from "@/components/ugc/ImageDropzone";
import TikTokLinkInput, { type TikTokReference } from "@/components/ugc/TikTokLinkInput";
import CharactersStrip, { type UgcCharacter } from "@/components/ugc/CharactersStrip";
import ProjectsPanel, { type UgcProject } from "@/components/ugc/ProjectsPanel";
import ProductsPanel, { type UgcProduct } from "@/components/ugc/ProductsPanel";
import VideoGallery, { type VideoRow } from "@/components/ugc/VideoGallery";
import TariffsPanel from "@/components/ugc/TariffsPanel";
import QuickStartPanel, { type QuickStartResult } from "@/components/ugc/QuickStartPanel";
import CarouselPanel from "@/components/ugc/CarouselPanel";
import CaptionCard, { type Caption } from "@/components/ugc/CaptionCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { eurFromTokens, formatEur, tokensForVideo } from "@/lib/ugcPricing";
import { UGC_PRESETS, getPreset } from "@/lib/ugcPresets";
import { checkPolicy, hasBlocking } from "@/lib/ugcPolicy";
import PolicyCheck from "@/components/ugc/PolicyCheck";

const RESOLUTIONS = ["360p", "720p", "1080p"] as const;
const DURATIONS = [4, 6, 8, 10] as const;
const MAX_REFS = 4;

type RefImage = { data: string; mimeType: string; preview: string };

// Título y descripción de cada sección del estudio.
const SECTION_META: Record<string, { title: string; subtitle: string }> = {
  captura: {
    title: "Sube tu captura",
    subtitle: "Arrastra la ficha del producto de TikTok Shop y te devolvemos producto, guion y texto para publicar.",
  },
  generar: {
    title: "Crear vídeo",
    subtitle: "Elige estilo, personaje y formato. El asistente escribe el guion y tú solo revisas antes de generar.",
  },
  carruseles: {
    title: "Carruseles",
    subtitle: "Seis estilos de carrusel con el texto ya puesto sobre cada lámina, listos para descargar.",
  },
  proyectos: {
    title: "Proyectos",
    subtitle: "Guarda personaje, tono y notas de marca para que todas tus piezas mantengan la misma línea.",
  },
  productos: {
    title: "Productos",
    subtitle: "Ficha, fotos, vistas 3D y puntos ciegos para que la IA no se invente nada del producto.",
  },
  tarifas: {
    title: "Plan y tokens",
    subtitle: "Consulta tu consumo, cambia de plan o recarga tokens cuando lo necesites.",
  },
};

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
  <Button
    type="button"
    variant="outline"
    size="sm"
    {...rest}
    className={`h-8 rounded-md px-3 text-xs transition-colors disabled:opacity-40 ${
      active ? "border-primary/50 bg-primary/10 text-foreground" : "border-border bg-transparent text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </Button>
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
  // Hasta cuatro imágenes de referencia: la primera es el punto de partida.
  const [images, setImages] = useState<RefImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [keepingId, setKeepingId] = useState<string | null>(null);
  const [extendFrom, setExtendFrom] = useState<VideoRow | null>(null);
  // Referencia traída de un enlace de TikTok (vídeo o producto de TikTok Shop).
  const [reference, setReference] = useState<{ url: string; summary: string; kind: string } | null>(null);
  // Copiar del vídeo de referencia el gancho, la luz, la cámara y cómo se muestra el producto (nunca personas).
  const [copyStyle, setCopyStyle] = useState(true);
  // Contexto (estilo + proyecto + producto) con el que se escribió el guion actual.
  const [promptContext, setPromptContext] = useState<string | null>(null);

  const [projects, setProjects] = useState<UgcProject[]>([]);
  const [products, setProducts] = useState<UgcProduct[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [characters, setCharacters] = useState<UgcCharacter[]>([]);
  const [characterId, setCharacterId] = useState<string | null>(null);

  const [tab, setTab] = useState("captura");
  const [captioningId, setCaptioningId] = useState<string | null>(null);
  const [activeCaption, setActiveCaption] = useState<Caption | null>(null);

  

  const MAX_TOTAL_SECONDS = 50;
  const remainingSeconds = extendFrom ? Math.max(0, MAX_TOTAL_SECONDS - Number(extendFrom.duration_seconds)) : MAX_TOTAL_SECONDS;
  const effectiveResolution = extendFrom ? extendFrom.resolution : resolution;
  const cost = tokensForVideo(effectiveResolution, duration);
  const contextKey = `${presetId}|${projectId ?? ""}|${productId ?? ""}`;
  const promptDrifted = prompt.trim().length > 20 && promptContext !== null && promptContext !== contextKey;
  const image = images[0] ?? null;
  const policyIssues = checkPolicy(prompt);
  const policyBlocked = hasBlocking(policyIssues);

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
    // Crea la cuenta de tokens con el saldo de prueba si el usuario aún no la tiene.
    const { data: ensured } = await supabase.rpc("ugc_ensure_account");
    const row = Array.isArray(ensured) ? ensured[0] : null;
    if (row) {
      setBalance(row.balance_tokens);
      setPlan(row.plan);
      return;
    }
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
    const { data } = await supabase.from("ugc_products").select("id, name, description, image_path, blind_spots, source_url, model_path, render_paths").order("created_at", { ascending: false });
    setProducts((data ?? []) as UgcProduct[]);
  }, []);

  const loadCharacters = useCallback(async () => {
    const { data } = await supabase.from("ugc_characters").select("id, name, image_path").order("created_at", { ascending: false });
    setCharacters((data ?? []) as UgcCharacter[]);
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
    loadCharacters();
    loadVideos();
  }, [checkingAuth, loadBalance, loadProjects, loadProducts, loadCharacters, loadVideos]);

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

  async function pickImage(file: File, mode: "append" | "primary" = "append") {
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Imagen demasiado grande", description: "Usa una foto de menos de 8 MB.", variant: "destructive" });
      return;
    }
    const buffer = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    const next: RefImage = { data: btoa(binary), mimeType: file.type, preview: URL.createObjectURL(file) };
    setImages((prev) => (mode === "primary" ? [next, ...prev] : [...prev, next]).slice(0, MAX_REFS));
  }

  // Añade varias imágenes de referencia de una vez (cara, producto, ángulos, escenario).
  async function pickImages(files: File[]) {
    const room = MAX_REFS - images.length;
    if (room <= 0) {
      toast({ title: `Máximo ${MAX_REFS} imágenes`, description: "Quita alguna para añadir otra.", variant: "destructive" });
      return;
    }
    for (const file of files.slice(0, room)) await pickImage(file);
  }

  // Usa un personaje guardado como imagen de partida y pide mantener su cara, cuerpo y voz.
  async function useCharacter(file: File, name: string, id: string) {
    await pickImage(file, "primary");
    setCharacterId(id);
    setPrompt((prev) => {
      const base = prev.replace(IDENTITY_NOTE, "").trim();
      return base ? `${base}\n\n${IDENTITY_NOTE}` : IDENTITY_NOTE;
    });
    toast({ title: `${name} fijado`, description: "Los vídeos mantendrán esta misma persona y su voz." });
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
    setExtendFrom(null);
    setPromptContext(`${presetId}|${v.project_id ?? ""}|${v.product_id ?? ""}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast({
      title: "Guion cargado",
      description: "Edítalo, o cambia el estilo o el producto y pulsa Reescribir guion.",
    });
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
      setImages([frame]);
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

  // Prepara una continuación: el vídeo elegido será el punto de partida.
  function extendVideo(v: VideoRow) {
    setExtendFrom(v);
    setImages([]);
    setCharacterId(null);
    setResolution(v.resolution);
    setAspectRatio(v.aspect_ratio === "16:9" ? "16:9" : "9:16");
    setDuration(Math.min(6, Math.max(4, 50 - Number(v.duration_seconds))));
    if (v.project_id !== undefined) setProjectId(v.project_id ?? null);
    if (v.product_id !== undefined) setProductId(v.product_id ?? null);
    setPrompt("");
    setIdea("");
    setPromptContext(null);
    setReference(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast({
      title: "Continuación preparada",
      description: "Escribe qué pasa a continuación y elige cuántos segundos añadir.",
    });
  }

  async function writeWithAssistant(rewrite = false) {
    const seed = idea.trim() || (rewrite ? "" : prompt.trim());
    if (!rewrite && seed.length < 3) {
      toast({ title: "Cuéntame la idea", description: "Una frase basta: “chica probando el sérum en el baño”.", variant: "destructive" });
      return;
    }
    setAssisting(true);
    const { data, error } = await supabase.functions.invoke("ugc-prompt", {
      body: {
        idea: seed,
        ...(rewrite ? { basePrompt: prompt } : {}),
        presetId,
        projectId,
        productId,
        aspectRatio,
        duration,
        ...(reference ? { reference: reference.summary } : {}),
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
    setPromptContext(contextKey);
    toast({
      title: rewrite ? "Guion reescrito" : "Guion listo",
      description: rewrite
        ? "Lo hemos adaptado al estilo, proyecto y producto que has elegido."
        : "Revísalo y ajusta lo que quieras antes de generar.",
    });
  }

  async function generate() {
    if (prompt.trim().length < 5) {
      toast({ title: "Falta la descripción", description: "Usa el asistente o escribe qué debe pasar.", variant: "destructive" });
      return;
    }
    if (policyBlocked) {
      toast({
        title: "Eso no se puede promocionar en TikTok Shop",
        description: "Cambia lo marcado en rojo: es contenido prohibido de raíz, no un aviso. El resto de avisos no impide generar.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("generate-ugc-video", {
      body: {
        prompt,
        presetId,
        resolution: effectiveResolution,
        duration,
        ...(extendFrom ? { extendFromVideoId: extendFrom.id } : {}),
        aspectRatio,
        projectId,
        productId,
        ...(reference ? { sourceUrl: reference.url, styleReference: copyStyle ? reference.summary : null } : {}),
        ...(image ? { image: { data: image.data, mimeType: image.mimeType } } : {}),
        images: images.map(({ data, mimeType }) => ({ data, mimeType })),
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
    setExtendFrom(null);
    if (typeof data.balance === "number") setBalance(data.balance);
  }

  // Escribe la ficha para publicar (título, descripción con hashtags y tarjeta) de un vídeo ya listo.
  async function writeCaption(video: VideoRow) {
    setCaptioningId(video.id);
    const { data, error } = await supabase.functions.invoke("ugc-caption", { body: { videoId: video.id } });
    setCaptioningId(null);
    const message = (data as { error?: string } | null)?.error;
    if (error || message || !data?.caption) {
      toast({
        title: "No hemos podido escribir la ficha",
        description: message ?? error?.message ?? "Inténtalo de nuevo en un momento.",
        variant: "destructive",
      });
      return;
    }
    setActiveCaption(data.caption as Caption);
  }

  // Pasa de la captura al panel de generación (o de carruseles) con todo relleno.
  function applyQuickStart(result: QuickStartResult, target: "video" | "carousel") {
    setProductId(result.product.id);
    loadProducts();
    if (target === "carousel") {
      setTab("carruseles");
      return;
    }
    setPresetId(result.presetId);
    setAspectRatio(result.aspectRatio);
    setPrompt(result.prompt);
    setPromptContext(`${result.presetId}|${projectId ?? ""}|${result.product.id}`);
    setActiveCaption(result.caption);
    setTab("generar");
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const lowBalance = balance !== null && balance < cost;

  const meta = SECTION_META[tab] ?? SECTION_META.captura;

  return (
    <>
      <Helmet>
        <title>Estudio UGC con IA — TikShopTok</title>
        <meta name="description" content="Herramienta interna de TikShopTok para generar vídeos UGC con IA." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <StudioShell
        tab={tab}
        onTab={setTab}
        balance={balance}
        plan={plan}
        counts={{ proyectos: projects.length, productos: products.length }}
        title={meta.title}
        subtitle={meta.subtitle}
      >
        {tab === "captura" && (
          <QuickStartPanel
            onVideo={(result) => applyQuickStart(result, "video")}
            onCarousel={(result) => applyQuickStart(result, "carousel")}
            onProductsChanged={loadProducts}
          />
        )}

        {tab === "generar" && (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-8">
            <div className="studio-card overflow-hidden xl:order-2">
              <div className="space-y-7 p-5 lg:p-6">
                {(projects.length > 0 || products.length > 0) && (
                  <div className="space-y-5">
                    <p className="studio-group-title">Contexto</p>
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
                        <p className="studio-hint">La foto guardada se reencuadra al formato que elijas.</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="studio-divider" />

                <div className="space-y-5">
                  <p className="studio-group-title">Estilo y referencias</p>
                  <div className="space-y-2">
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
                    <p className="studio-hint">{getPreset(presetId)?.hint}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Referencia desde TikTok (opcional)</Label>
                    <TikTokLinkInput
                      placeholder="Enlace de vídeo o de producto de TikTok Shop"
                      hint="De un vídeo copiamos el gancho, la luz, la cámara y cómo se muestra el producto; nunca la cara ni la voz de quien sale. De un producto traemos su ficha y su foto."
                      onLoaded={(ref: TikTokReference) => {
                        const summary = [ref.title, ref.author ? `Cuenta: ${ref.author}.` : "", ref.price ? `Precio: ${ref.price}.` : ""]
                          .filter(Boolean)
                          .join(" ");
                        setReference({ url: ref.url, summary: summary || ref.url, kind: ref.kind });
                        setCopyStyle(true);
                        // La portada de un vídeo suele ser la cara del creador: solo usamos
                        // como imagen de partida la foto de una ficha de producto.
                        if (ref.image && ref.kind === "product") {
                          setImages((prev) =>
                            [
                              {
                                data: ref.image!.data,
                                mimeType: ref.image!.mimeType,
                                preview: `data:${ref.image!.mimeType};base64,${ref.image!.data}`,
                              },
                              ...prev,
                            ].slice(0, MAX_REFS),
                          );
                        }
                        if (!idea.trim() && ref.title) setIdea(ref.title.slice(0, 120));
                        if (!ref.blocked) {
                          toast({
                            title: ref.kind === "product" ? "Producto de TikTok Shop cargado" : "Vídeo de referencia cargado",
                            description:
                              ref.kind === "product"
                                ? "Lo usamos como referencia del guion y como imagen de partida."
                                : "Copiaremos su estilo y cómo enseña el producto, nunca a la persona que sale.",
                          });
                        }
                      }}
                    />
                    {reference && (
                      <div className="space-y-2 rounded-xl border border-white/[0.07] bg-background/40 px-3 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-muted-foreground line-clamp-2">{reference.summary}</p>
                          <Button variant="ghost" size="sm" className="h-7 shrink-0 px-2 text-[11px]" onClick={() => setReference(null)}>
                            <X className="mr-1 h-3 w-3" /> Quitar
                          </Button>
                        </div>
                        {reference.kind === "video" && (
                          <div className="space-y-2 border-t border-white/[0.07] pt-2">
                            <Chip active={copyStyle} onClick={() => setCopyStyle((v) => !v)}>
                              {copyStyle ? "Copiando estilo del vídeo" : "Solo como idea del guion"}
                            </Chip>
                            <p className="studio-hint">
                              Copiamos gancho, ritmo, encuadre, luz y la forma de mostrar el producto. Nunca la cara, el cuerpo,
                              la ropa ni la voz de quien aparece: tu protagonista sigue siendo el tuyo.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="studio-divider" />

                <div className="space-y-5">
                  <p className="studio-group-title">Guion</p>
                  <div className="space-y-2">
                    <Label htmlFor="idea">Tu idea en una frase</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        id="idea"
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="Chica probando el sérum antes de salir"
                      />
                      <Button
                        variant="outline"
                        className="shrink-0 rounded-full"
                        onClick={() => writeWithAssistant(false)}
                        disabled={assisting}
                      >
                        {assisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        <span className="ml-2">Escribir guion</span>
                      </Button>
                    </div>
                  </div>

                  {extendFrom && (
                    <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">
                      <p className="font-medium">Continuación de un vídeo</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Seguimos el vídeo de {extendFrom.duration_seconds}s ({extendFrom.resolution} ·{" "}
                        {extendFrom.aspect_ratio ?? "9:16"}) y le añadimos los segundos que elijas, hasta{" "}
                        {MAX_TOTAL_SECONDS}s en total. Solo pagas los nuevos.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-8 rounded-full px-3 text-xs"
                        onClick={() => setExtendFrom(null)}
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Cancelar continuación
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="prompt">{extendFrom ? "Qué pasa a continuación" : "Guion del vídeo"}</Label>
                    <Textarea
                      id="prompt"
                      rows={7}
                      placeholder={
                        extendFrom
                          ? "Sigue hablando y enseña el interior del maletín mientras camina hacia la ventana…"
                          : "El asistente lo rellena por ti, o escríbelo tú: encuadre, luz, tono, qué dice…"
                      }
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    {promptDrifted && (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          Has cambiado el estilo, el proyecto o el producto: el guion todavía es el anterior.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full px-3 text-[11px]"
                          onClick={() => writeWithAssistant(true)}
                          disabled={assisting}
                        >
                          {assisting ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Reescribir guion
                        </Button>
                      </div>
                    )}
                    <PolicyCheck issues={policyIssues} ready={prompt.trim().length > 20} />
                  </div>
                </div>

                <div className="studio-divider" />

                <div className="space-y-5">
                  <p className="studio-group-title">Formato de salida</p>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Formato</Label>
                      <div className="flex gap-2">
                        {(["9:16", "16:9"] as const).map((r) => (
                          <Chip
                            key={r}
                            active={aspectRatio === r}
                            disabled={Boolean(extendFrom)}
                            onClick={() => setAspectRatio(r)}
                          >
                            {r}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{extendFrom ? "Segundos nuevos" : "Duración"}</Label>
                      <div className="flex flex-wrap gap-2">
                        {DURATIONS.map((d) => (
                          <Chip
                            key={d}
                            active={duration === d}
                            disabled={Boolean(extendFrom) && d > remainingSeconds}
                            onClick={() => setDuration(d)}
                          >
                            {extendFrom ? `+${d}s` : `${d}s`}
                          </Chip>
                        ))}
                      </div>
                      {extendFrom && (
                        <p className="studio-hint">
                          Total: {Number(extendFrom.duration_seconds) + duration}s de {MAX_TOTAL_SECONDS}s máximo
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Calidad</Label>
                      <div className="flex flex-wrap gap-2">
                        {RESOLUTIONS.map((r) => (
                          <Chip
                            key={r}
                            active={effectiveResolution === r}
                            disabled={Boolean(extendFrom)}
                            onClick={() => setResolution(r)}
                          >
                            {r}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={extendFrom ? "hidden" : "space-y-5"}>
                  <div className="studio-divider" />
                  <p className="studio-group-title">Personaje y referencias</p>
                  <div className="space-y-2">
                    <Label>Imágenes de referencia (hasta {MAX_REFS})</Label>
                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {images.map((img, index) => (
                          <div key={`${img.preview}-${index}`} className="relative">
                            <img
                              src={img.preview}
                              alt={index === 0 ? "Imagen de partida" : `Referencia ${index + 1}`}
                              className={`h-20 w-20 rounded-xl object-cover ${index === 0 ? "ring-2 ring-primary/60" : ""}`}
                            />
                            <span className="absolute bottom-1 left-1 rounded-full bg-background/85 px-1.5 text-[10px]">
                              {index === 0 ? "Partida" : `Ref ${index + 1}`}
                            </span>
                            <button
                              type="button"
                              aria-label="Quitar imagen"
                              onClick={() => {
                                setImages((prev) => prev.filter((_, i) => i !== index));
                                if (index === 0) setCharacterId(null);
                              }}
                              className="absolute -right-1.5 -top-1.5 rounded-full border border-white/15 bg-background p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {images.length < MAX_REFS && (
                      <ImageDropzone
                        multiple
                        title={images.length === 0 ? "Arrastra tus imágenes de referencia" : "Añadir otra referencia"}
                        hint="cara, producto, ángulos o escenario · puedes soltar varias a la vez"
                        onFiles={pickImages}
                      />
                    )}
                    <p className="studio-hint">
                      La primera es el punto de partida del vídeo; las demás son referencias de apoyo (otros ángulos del
                      producto, detalles o el sitio donde se graba).
                    </p>
                  </div>

                  <CharactersStrip
                    characters={characters}
                    onChanged={loadCharacters}
                    activeId={characterId}
                    onUse={(file, character) => useCharacter(file, character.name, character.id)}
                  />
                </div>
              </div>

              {/* Barra de acción fija al pie de la tarjeta */}
              <div className="sticky bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur-xl lg:p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Coste de este vídeo</span>
                  <span className="font-semibold tabular-nums">
                    {cost} tokens · {formatEur(eurFromTokens(cost))}
                  </span>
                </div>
                <Button
                  onClick={generate}
                  disabled={busy || lowBalance || policyBlocked}
                  className="mt-3 h-11 w-full rounded-md text-sm font-semibold"
                >
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {busy ? "Enviando…" : "Generar vídeo"}
                </Button>
                <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
                  {policyBlocked
                    ? "Ese producto o esa persona no se pueden promocionar en TikTok Shop. Cambia lo marcado en rojo."
                    : lowBalance
                      ? "No te quedan tokens suficientes. Recarga desde Plan y tokens."
                      : "Cada vídeo tarda 1–3 minutos. Si falla, te devolvemos los tokens."}
                </p>
              </div>
            </div>

            <div className="min-w-0 xl:order-1">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-bold tracking-tight">Tus vídeos</h2>
                <span className="text-xs text-muted-foreground tabular-nums">{videos.length}</span>
              </div>
              <div className="mt-4">
                <VideoGallery
                  videos={videos}
                  urls={urls}
                  onReuse={reuseVideo}
                  onKeepIdentity={keepIdentity}
                  onExtend={extendVideo}
                  onCaption={writeCaption}
                  keepingId={keepingId}
                  captioningId={captioningId}
                />
              </div>
            </div>
          </section>
        )}

        {tab === "carruseles" && (
          <CarouselPanel
            products={products}
            productId={productId}
            onProductId={setProductId}
            balance={balance}
            onBalance={setBalance}
          />
        )}

        {tab === "proyectos" && <ProjectsPanel projects={projects} onChanged={loadProjects} />}

        {tab === "productos" && <ProductsPanel products={products} onChanged={loadProducts} />}

        {tab === "tarifas" && (
          <TariffsPanel
            onPick={(label) =>
              toast({
                title: `${label} seleccionado`,
                description: "El pago con tarjeta se activa en el siguiente paso; mientras tanto te lo asignamos a mano.",
              })
            }
          />
        )}
      </StudioShell>

      <Dialog open={activeCaption !== null} onOpenChange={(open) => !open && setActiveCaption(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Listo para publicar</DialogTitle>
          </DialogHeader>
          {activeCaption && <CaptionCard caption={activeCaption} title="Copia y pega en TikTok" />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UgcStudio;
