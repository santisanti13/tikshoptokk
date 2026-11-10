import { useState } from "react";
import { z } from "zod";
import { Loader2, Send, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Dinos tu nombre").max(120),
  email: z.string().trim().email("Email inválido").max(255),
  profile_type: z.enum(["negocio_local", "creador", "marca", "otro"]),
  business_name: z.string().trim().max(200).optional(),
  city: z.string().trim().max(120).optional(),
  message: z.string().trim().max(1000).optional(),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

const PROFILE_LABELS: Record<WaitlistForm["profile_type"], string> = {
  negocio_local: "Negocio local (restaurante, hotel, experiencia...)",
  creador: "Creador/a de contenido",
  marca: "Marca o agencia",
  otro: "Otro",
};

interface TikTokGoWaitlistProps {
  compact?: boolean;
}

const TikTokGoWaitlist = ({ compact = false }: TikTokGoWaitlistProps) => {
  const [form, setForm] = useState<Partial<WaitlistForm>>({ profile_type: "negocio_local" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key: keyof WaitlistForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = waitlistSchema.safeParse(form);
    if (!parsed.success) {
      toast.error("Revisa el formulario", { description: parsed.error.issues[0].message });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("tiktok_go_waitlist").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        profile_type: parsed.data.profile_type,
        business_name: parsed.data.business_name || null,
        city: parsed.data.city || null,
        message: parsed.data.message || null,
      });
      if (error) throw error;

      // Notificación al equipo (no bloquea el registro si falla)
      supabase.functions
        .invoke("send-contact-notification", {
          body: {
            type: "contact_notification",
            data: {
              name: parsed.data.name,
              email: parsed.data.email,
              company: parsed.data.business_name,
              message: `Nuevo registro en la lista de espera de TikTok Go.\nPerfil: ${PROFILE_LABELS[parsed.data.profile_type]}${parsed.data.city ? `\nCiudad: ${parsed.data.city}` : ""}${parsed.data.message ? `\n\n${parsed.data.message}` : ""}`,
            },
          },
        })
        .catch(() => undefined);

      setDone(true);
      toast.success("¡Estás en la lista!", {
        description: "Te avisaremos en cuanto TikTok Go aterrice en España.",
      });
    } catch (err) {
      console.error("Failed to join TikTok Go waitlist:", err);
      toast.error("Error al enviar", { description: "Inténtalo de nuevo más tarde." });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-white/[0.07] bg-card/60 p-8 text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/20">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-display text-xl font-bold">Apuntado a la lista</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Cuando TikTok Go se active en España serás de los primeros en saberlo y en tener una propuesta encima de la mesa.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-3xl border border-white/[0.07] bg-card/60 ${compact ? "p-5" : "p-6 md:p-8"}`}
    >
      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div className="space-y-2">
          <Label htmlFor="tg-name">Nombre</Label>
          <Input
            id="tg-name"
            placeholder="Tu nombre"
            value={form.name ?? ""}
            onChange={(e) => set("name", e.target.value)}
            required
            maxLength={120}
            className="h-12 rounded-xl border-white/10 bg-white/5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tg-email">Email</Label>
          <Input
            id="tg-email"
            type="email"
            placeholder="tu@email.com"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            required
            maxLength={255}
            className="h-12 rounded-xl border-white/10 bg-white/5"
          />
        </div>
        <div className="space-y-2">
          <Label>Soy...</Label>
          <Select
            value={form.profile_type}
            onValueChange={(v) => set("profile_type", v)}
          >
            <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROFILE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tg-business">Negocio o cuenta (opcional)</Label>
          <Input
            id="tg-business"
            placeholder="Nombre de tu negocio o @cuenta"
            value={form.business_name ?? ""}
            onChange={(e) => set("business_name", e.target.value)}
            maxLength={200}
            className="h-12 rounded-xl border-white/10 bg-white/5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tg-city">Ciudad (opcional)</Label>
          <Input
            id="tg-city"
            placeholder="Valencia, Madrid..."
            value={form.city ?? ""}
            onChange={(e) => set("city", e.target.value)}
            maxLength={120}
            className="h-12 rounded-xl border-white/10 bg-white/5"
          />
        </div>
        {!compact && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tg-message">Cuéntanos tu caso (opcional)</Label>
            <Textarea
              id="tg-message"
              placeholder="Qué vendes, dónde estás, qué te gustaría conseguir con TikTok Go..."
              value={form.message ?? ""}
              onChange={(e) => set("message", e.target.value)}
              maxLength={1000}
              rows={3}
              className="rounded-xl border-white/10 bg-white/5"
            />
          </div>
        )}
      </div>
      <Button type="submit" size="lg" disabled={submitting} className="mt-5 w-full gap-2 rounded-full glow-pink">
        {submitting ? (
          <>Enviando... <Loader2 className="h-4 w-4 animate-spin" /></>
        ) : (
          <>Apuntarme a la lista de espera <Send className="h-4 w-4" /></>
        )}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Sin spam: solo te escribiremos cuando haya novedades reales de TikTok Go en España.
      </p>
    </form>
  );
};

export default TikTokGoWaitlist;
