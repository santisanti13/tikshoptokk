import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Images, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CaptionCard, { type Caption } from "@/components/ugc/CaptionCard";
import { CAROUSEL_STYLES, CAROUSEL_TOKENS } from "@/lib/ugcCarouselStyles";
import { eurFromTokens, formatEur } from "@/lib/ugcPricing";
import type { UgcProduct } from "@/components/ugc/ProductsPanel";

export type CarouselRow = {
  id: string;
  style_id: string;
  headline: string | null;
  slides: { text: string; image_path: string }[];
  caption: Caption | null;
  status: string;
  created_at: string;
};

type Props = {
  products: UgcProduct[];
  productId: string | null;
  onProductId: (id: string | null) => void;
  balance: number | null;
  onBalance: (value: number) => void;
};

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

/** Dibuja la imagen con su texto encima y la descarga como PNG. */
async function downloadSlide(url: string, text: string, name: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("image"));
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(img, 0, 0);

  if (text) {
    const fontSize = Math.round(canvas.width * 0.062);
    ctx.font = `800 ${fontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Partimos el texto en líneas que quepan en el 86% del ancho.
    const maxWidth = canvas.width * 0.86;
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);

    const lineHeight = fontSize * 1.22;
    const blockHeight = lines.length * lineHeight;
    let y = canvas.height * 0.12;
    if (y + blockHeight > canvas.height * 0.9) y = canvas.height * 0.9 - blockHeight;

    lines.forEach((line, index) => {
      const lineY = y + index * lineHeight;
      const width = ctx.measureText(line).width;
      const padX = fontSize * 0.34;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      const boxX = canvas.width / 2 - width / 2 - padX;
      const boxY = lineY - fontSize * 0.12;
      const boxW = width + padX * 2;
      const boxH = lineHeight;
      const r = fontSize * 0.24;
      ctx.moveTo(boxX + r, boxY);
      ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + boxH, r);
      ctx.arcTo(boxX + boxW, boxY + boxH, boxX, boxY + boxH, r);
      ctx.arcTo(boxX, boxY + boxH, boxX, boxY, r);
      ctx.arcTo(boxX, boxY, boxX + boxW, boxY, r);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(line, canvas.width / 2, lineY);
    });
  }

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = name;
  link.click();
}

const CarouselPanel = ({ products, productId, onProductId, balance, onBalance }: Props) => {
  const { toast } = useToast();
  const [styleId, setStyleId] = useState<string>(CAROUSEL_STYLES[0].id);
  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<CarouselRow[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("ugc_carousels")
      .select("id, style_id, headline, slides, caption, status, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    const list = (data ?? []) as unknown as CarouselRow[];
    setRows(list);

    const paths = list.flatMap((r) => (r.slides ?? []).map((s) => s.image_path)).filter(Boolean);
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage.from("ugc-videos").createSignedUrls(paths, 3600);
      const map: Record<string, string> = {};
      (signed ?? []).forEach((s) => {
        if (s.path && s.signedUrl) map[s.path] = s.signedUrl;
      });
      setUrls(map);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const generate = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ugc-carousel", {
        body: { styleId, productId, idea: idea.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (typeof data?.balance === "number") onBalance(data.balance);
      toast({ title: "Carrusel listo", description: `Se han descontado ${CAROUSEL_TOKENS} tokens.` });
      setIdea("");
      await load();
    } catch (e) {
      toast({
        title: "No se pudo crear el carrusel",
        description: e instanceof Error ? e.message : "Inténtalo de nuevo en un momento.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const lowBalance = (balance ?? 0) < CAROUSEL_TOKENS;
  const style = CAROUSEL_STYLES.find((s) => s.id === styleId)!;

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="font-display text-lg font-bold tracking-tight">Carrusel de imágenes</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cuesta {CAROUSEL_TOKENS} tokens ({formatEur(eurFromTokens(CAROUSEL_TOKENS))}) y sale con los textos puestos y la
          ficha para publicar.
        </p>

        {products.length > 0 && (
          <div className="mt-5 space-y-2">
            <Label>Producto</Label>
            <div className="flex flex-wrap gap-2">
              <Chip active={productId === null} onClick={() => onProductId(null)}>
                Ninguno
              </Chip>
              {products.map((p) => (
                <Chip key={p.id} active={productId === p.id} onClick={() => onProductId(p.id)}>
                  {p.name}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 space-y-2">
          <Label>Estilo</Label>
          <div className="flex flex-wrap gap-2">
            {CAROUSEL_STYLES.map((s) => (
              <Chip key={s.id} active={styleId === s.id} onClick={() => setStyleId(s.id)}>
                {s.label}
              </Chip>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {style.hint} · {style.slides} láminas
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <Label htmlFor="carousel-idea">Idea (opcional)</Label>
          <Textarea
            id="carousel-idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={3}
            placeholder="Ej.: enfócalo a quien viaja con equipaje de mano"
          />
        </div>

        <Button onClick={generate} disabled={busy || lowBalance} className="mt-6 w-full rounded-full">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Images className="mr-2 h-4 w-4" />}
          {busy ? "Creando láminas…" : "Crear carrusel"}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          {lowBalance
            ? "No te quedan tokens suficientes. Recarga desde la pestaña Tarifas."
            : "Tarda menos de un minuto. Si falla, te devolvemos los tokens."}
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="font-display text-xl font-bold tracking-tight">Tus carruseles</h2>
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-background/30 p-10 text-center text-sm text-muted-foreground">
            Todavía no has creado ningún carrusel.
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="rounded-3xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display text-base font-bold tracking-tight">
                    {row.headline || CAROUSEL_STYLES.find((s) => s.id === row.style_id)?.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.slides?.length ?? 0} láminas · {new Date(row.created_at).toLocaleString("es-ES")}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {CAROUSEL_STYLES.find((s) => s.id === row.style_id)?.label}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(row.slides ?? []).map((slide, index) => {
                  const url = urls[slide.image_path];
                  return (
                    <div key={slide.image_path} className="space-y-2">
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-background/40">
                        {url ? (
                          <img src={url} alt={slide.text || `Lámina ${index + 1}`} className="aspect-[9/16] w-full object-cover" />
                        ) : (
                          <div className="aspect-[9/16] w-full animate-pulse bg-white/5" />
                        )}
                        {slide.text && (
                          <p className="absolute inset-x-2 top-3 rounded-xl bg-black/60 px-2 py-1 text-center text-[11px] font-bold leading-tight text-white">
                            {slide.text}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="w-full rounded-full text-xs"
                        disabled={!url}
                        onClick={() =>
                          url && downloadSlide(url, slide.text, `carrusel-${row.id.slice(0, 6)}-${index + 1}.png`)
                        }
                      >
                        <Download className="mr-1 h-3.5 w-3.5" /> PNG
                      </Button>
                    </div>
                  );
                })}
              </div>

              {row.caption && (
                <div className="mt-5">
                  <CaptionCard caption={row.caption} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default CarouselPanel;
