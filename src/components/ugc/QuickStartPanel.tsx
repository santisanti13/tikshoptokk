import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Image as ImageIcon, Film } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageDropzone from "@/components/ugc/ImageDropzone";
import CaptionCard, { type Caption } from "@/components/ugc/CaptionCard";
import type { UgcProduct } from "@/components/ugc/ProductsPanel";

export type QuickStartResult = {
  product: UgcProduct;
  presetId: string;
  aspectRatio: "9:16" | "16:9";
  prompt: string;
  caption: Caption;
  listing: { name: string; price: string; seller: string; category: string };
};

type Props = {
  onVideo: (result: QuickStartResult) => void;
  onCarousel: (result: QuickStartResult) => void;
  onProductsChanged: () => void;
};

const fileToBase64 = (file: File) =>
  new Promise<{ data: string; mimeType: string; preview: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      resolve({ data: url.split(",")[1], mimeType: file.type, preview: url });
    };
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });

/** De captura a contenido: subes la ficha de TikTok Shop y sale todo escrito. */
const QuickStartPanel = ({ onVideo, onCarousel, onProductsChanged }: Props) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<QuickStartResult | null>(null);

  const run = async (file: File) => {
    setBusy(true);
    setResult(null);
    try {
      const image = await fileToBase64(file);
      setPreview(image.preview);
      const { data, error } = await supabase.functions.invoke("ugc-quickstart", {
        body: { image: { data: image.data, mimeType: image.mimeType } },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as QuickStartResult);
      onProductsChanged();
      toast({ title: "Listo", description: "Hemos leído la ficha y escrito el guion y el texto para publicar." });
    } catch (e) {
      toast({
        title: "No hemos podido leer la captura",
        description: e instanceof Error ? e.message : "Prueba con otra imagen más nítida.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="font-display text-lg font-bold tracking-tight">Sube tu captura</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Una captura de la ficha del producto en TikTok Shop es suficiente. Leemos el nombre, el precio y los argumentos
          de venta, guardamos el producto y escribimos el guion y el texto para publicar.
        </p>

        <div className="mt-5">
          <ImageDropzone
            title="Arrastra la captura de la ficha"
            hint="PNG o JPG. También puedes pegarla con Ctrl+V."
            disabled={busy}
            onFiles={(files) => files[0] && run(files[0])}
          />
        </div>

        {preview && (
          <img src={preview} alt="Captura del producto" className="mt-4 max-h-64 w-full rounded-2xl object-contain" />
        )}

        {busy && (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Leyendo la ficha y escribiendo el guion…
          </p>
        )}
      </div>

      <div>
        {!result ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-background/30 p-10 text-center text-sm text-muted-foreground">
            Aquí aparecerá el producto, el guion y el texto para publicar en cuanto subas la captura.
          </div>
        ) : (
          <div className="space-y-6 rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Producto detectado</p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight">{result.listing.name}</h3>
              <p className="text-sm text-muted-foreground">
                {[result.listing.price, result.listing.seller, result.listing.category].filter(Boolean).join(" · ") ||
                  "Guardado en tu biblioteca de productos."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Guion propuesto</p>
              <p className="mt-2 whitespace-pre-line text-sm">{result.prompt}</p>
            </div>

            <CaptionCard caption={result.caption} />

            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full" onClick={() => onVideo(result)}>
                <Film className="mr-2 h-4 w-4" /> Crear vídeo
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => onCarousel(result)}>
                <ImageIcon className="mr-2 h-4 w-4" /> Crear carrusel
              </Button>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Puedes ajustar todo antes de generar.
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuickStartPanel;
