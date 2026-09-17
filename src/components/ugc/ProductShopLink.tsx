import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Copy, ExternalLink, QrCode, Smartphone } from "lucide-react";

/** true solo si el enlace apunta a una ficha de producto, no a la portada de TikTok. */
export const isShopProductLink = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return /shop\.tiktok|\/view\/product|product_id|\/pdp/i.test(url);
};

type Props = { url: string; compact?: boolean };

/**
 * La ficha de TikTok Shop solo se abre bien dentro de la app del móvil: en
 * escritorio ofrecemos copiar el enlace y un QR para abrirlo en el teléfono.
 */
const ProductShopLink = ({ url, compact }: Props) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!qr) return;
    // nada: el QR se genera al pedirlo
  }, [qr]);

  async function showQr() {
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 220, margin: 1, color: { dark: "#0f0f14", light: "#ffffff" } });
      setQr(dataUrl);
    } catch {
      toast({ title: "No se pudo crear el QR", description: "Copia el enlace y ábrelo en el móvil.", variant: "destructive" });
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Enlace copiado", description: "Ábrelo en el móvil, dentro de la app de TikTok." });
    } catch {
      toast({ title: "Copia el enlace a mano", description: url, variant: "destructive" });
    }
  }

  if (compact) {
    return isMobile ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-primary/30 px-2 py-0.5 text-[10px] text-primary"
      >
        Abrir ficha
      </a>
    ) : (
      <button
        type="button"
        onClick={copy}
        className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
      >
        Copiar enlace de la ficha
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-white/[0.07] bg-background/40 p-3">
      {isMobile ? (
        <>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> Abrir la ficha en la app de TikTok
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">
            Para traer otro producto: en la app de TikTok abre la ficha, toca Compartir → Copiar enlace y pégalo aquí.
          </p>
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="h-3.5 w-3.5 text-primary" /> TikTok Shop solo se abre bien desde el móvil. En el
            ordenador este enlace te lleva a TikTok a secas.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="rounded-full" onClick={copy}>
              <Copy className="mr-2 h-3.5 w-3.5" /> Copiar enlace
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={showQr}>
              <QrCode className="mr-2 h-3.5 w-3.5" /> Abrir en el móvil
            </Button>
          </div>
          {qr && (
            <div className="flex items-center gap-3">
              <img src={qr} alt="Código QR de la ficha del producto" className="h-28 w-28 rounded-lg bg-white p-1" />
              <p className="text-xs text-muted-foreground">Escanéalo con la cámara del móvil para abrir la ficha en la app.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductShopLink;
