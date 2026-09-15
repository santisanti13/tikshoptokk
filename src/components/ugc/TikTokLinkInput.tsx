import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link2, Loader2 } from "lucide-react";

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

type Props = {
  onLoaded: (ref: TikTokReference) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
};

/** Pega un enlace de TikTok (vídeo o producto de TikTok Shop) y trae su portada y su ficha. */
const TikTokLinkInput = ({ onLoaded, label, placeholder, hint }: Props) => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(url)) {
      toast({ title: "Pega un enlace de TikTok", description: "Vale el enlace de un vídeo o de un producto de TikTok Shop.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("tiktok-reference", { body: { url: url.trim() } });
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
        title: "Enlace del producto guardado",
        description: "TikTok no deja leer la ficha desde fuera. Pega la captura de la ficha (Ctrl+V) o suéltala aquí y la leemos entera.",
      });
    }
    setUrl("");
  }

  return (
    <div className="space-y-2">
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
          placeholder={placeholder ?? "https://www.tiktok.com/@cuenta/video/…"}
          aria-label={label ?? "Enlace de TikTok"}
        />
        <Button variant="outline" className="shrink-0 rounded-full" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">Traer</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {hint ?? "Vídeo de TikTok o producto de TikTok Shop: traemos la portada y el texto como referencia."}
      </p>
    </div>
  );
};

export default TikTokLinkInput;
