import { useState } from "react";
import { z } from "zod";
import { Loader2, Sparkles, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().trim().email("Email inválido").max(255);

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
}

const WaitlistDialog = ({ open, onOpenChange, itemName }: WaitlistDialogProps) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Email inválido", { description: parsed.error.issues[0].message });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-notification", {
        body: {
          type: "contact_notification",
          data: {
            name: "Waitlist Signup",
            email: parsed.data,
            company: itemName ? `Interés: ${itemName}` : undefined,
            message: `Nuevo registro en la lista de espera de la herramienta de Product Research en tiempo real.${itemName ? `\n\nElemento clicado: ${itemName}` : ""}`,
          },
        },
      });
      if (error) throw error;
      toast.success("¡Estás en la lista!", { description: "Te avisaremos cuando la herramienta esté disponible." });
      setEmail("");
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to join waitlist:", err);
      toast.error("Error al enviar", { description: "Inténtalo de nuevo más tarde." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-white/10 bg-card/95 backdrop-blur-xl">
        <div className="neon-blob-pink -right-16 -top-16 opacity-60 pointer-events-none absolute" />
        <DialogHeader className="relative">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="font-display text-2xl leading-tight">
            Únete a la <span className="gradient-text">lista de espera</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Apúntate a la lista de espera para acceder a nuestra herramienta que actualiza al minuto TikTok Shop, productos, afiliados, cuentas y agencias.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="relative mt-2 space-y-3">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 rounded-xl border-white/10 bg-white/5"
          />
          <Button type="submit" size="lg" disabled={submitting} className="w-full gap-2 rounded-full glow-pink">
            {submitting ? (
              <>Enviando... <Loader2 className="h-4 w-4 animate-spin" /></>
            ) : (
              <>Apuntarme <Send className="h-4 w-4" /></>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistDialog;
