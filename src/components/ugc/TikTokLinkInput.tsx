import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clapperboard, Loader2, ShoppingBag } from "lucide-react";

export type TikTokReference = {
  url: string;
  kind: "video" | "product";
  /** true cuando TikTok bloquea la lectura de la ficha: el enlace se guarda, la ficha se completa con captura. */
  blocked?: boolean;
  title: string | null;
  description: string | null;
  author: string | null;
  price: string | null;
  image: { data: string; mimeType: string } | null;
};

type Mode = "product" | "video";

type Props = {
  onLoaded: (ref: TikTokReference) => void;
  /** "product" = ficha de la tienda · "video" = vídeo del que copiar el estilo. */
  mode?: Mode;
  label?: string;
  placeholder?: string;
  hint?: string;
};

const COPY: Record<Mode, { label: string; placeholder: string; hint: string; action: string }> = {
  product: {
    label: "Ficha del producto en la tienda",
    placeholder: "https://shop.tiktok.com/view/product/…",
    hint: "Es el enlace de la ficha de la tienda. De aquí sacamos nombre, precio, foto y descripción del producto.",
    action: "Traer ficha",
  },
  video: {
    label: "Vídeo de referencia",
    placeholder: "https://www.tiktok.com/@cuenta/video/…",
    hint: "Es un vídeo que ya funciona. Copiamos su gancho, ritmo, luz, cámara y la forma de enseñar el producto; nunca la cara, el cuerpo, la ropa ni la voz de quien sale.",
    action: "Analizar vídeo",
  },
};

const looksLikeVideo = (url: string) => /\/video\/|\/photo\/|vm\.tiktok|vt\.tiktok/i.test(url);
const looksLikeProduct = (url: string) => /shop\.tiktok|\/view\/product|product_id|\/pdp/i.test(url);

/** Pega un enlace de TikTok. Con mode="product" es la ficha de la tienda; con mode="video" es el vídeo de referencia. */
const TikTokLinkInput = ({ onLoaded, mode = "video", label, placeholder, hint }: Props) => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const copy = COPY[mode];
  const Icon = mode === "product" ? ShoppingBag : Clapperboard;

  async function load() {
    const clean = url.trim();
    if (!/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(clean)) {
      toast({
        title: "Pega un enlace de TikTok",
        description:
          mode === "product"
            ? "Copia el enlace desde la ficha del producto en la app de TikTok (Compartir → Copiar enlace)."
            : "Copia el enlace del vídeo desde TikTok (Compartir → Copiar enlace).",
        variant: "destructive",
      });
      return;
    }
    // Aviso si el enlace es del otro tipo: son dos cosas distintas y se piden en sitios distintos.
    if (mode === "product" && looksLikeVideo(clean) && !looksLikeProduct(clean)) {
      toast({
        title: "Ese enlace es un vídeo, no una ficha",
        description: "Pégalo en «Vídeo de referencia». Aquí va el enlace de la ficha del producto en la tienda.",
        variant: "destructive",
      });
      return;
    }
    if (mode === "video" && looksLikeProduct(clean)) {
      toast({
        title: "Ese enlace es una ficha de producto",
        description: "Pégalo en «Ficha del producto en la tienda». Aquí va el enlace de un vídeo.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke("tiktok-reference", { body: { url: clean } });
    setLoading(false);
    const message = (data as { error?: string } | null)?.error;
    if (error || message || !data?.reference) {
      toast({
        title: "No se pudo leer el enlace",
        description: message ?? error?.message ?? "Prueba con otro enlace o sube la foto a mano.",
        variant: "destructive",
      });
      return;
    }
    const ref = data.reference as TikTokReference;
    onLoaded(ref);
    if (ref.blocked) {
      toast({
        title: ref.kind === "product" ? "Enlace de la ficha guardado" : "Enlace del vídeo guardado",
        description:
          ref.kind === "product"
            ? "TikTok no deja leer la ficha desde fuera. Pega la captura de la ficha (Ctrl+V) o suéltala aquí y la leemos entera."
            : "TikTok no deja leer el vídeo desde fuera. Haz una captura de un fotograma y suéltala aquí para copiar su estilo.",
      });
    }
    setUrl("");
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label ?? copy.label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              load();
            }
          }}
          placeholder={placeholder ?? copy.placeholder}
          aria-label={label ?? copy.label}
        />
        <Button variant="outline" className="shrink-0 rounded-full" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">{copy.action}</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{hint ?? copy.hint}</p>
    </div>
  );
};

export default TikTokLinkInput;
