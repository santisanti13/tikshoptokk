import { useState } from "react";
import { UGC_PLANS, UGC_TOPUPS, TOKENS_PER_SECOND, TOKEN_PRICE_EUR, formatEur, tokensForVideo, eurFromTokens } from "@/lib/ugcPricing";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { paymentsConfigured } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";

const EXAMPLES = [
  { resolution: "360p", duration: 4, label: "Prueba rápida" },
  { resolution: "720p", duration: 8, label: "Pieza estándar" },
  { resolution: "1080p", duration: 8, label: "Pieza premium" },
];

const TariffsPanel = ({ onPick }: { onPick?: (label: string) => void }) => {
  const { toast } = useToast();
  const [checkout, setCheckout] = useState<{ priceId: string; label: string } | null>(null);

  const buy = (priceId: string, label: string) => {
    onPick?.(label);
    if (!paymentsConfigured()) {
      toast({
        title: "Pagos no disponibles todavía",
        description: "El cobro con tarjeta se activa al publicar la web. Escríbenos y lo gestionamos manualmente.",
        variant: "destructive",
      });
      return;
    }
    setCheckout({ priceId, label });
  };

  const manageSubscription = async () => {
    setPortalLoading(true);
    const { data, error } = await supabase.functions.invoke("create-portal-session", {
      body: {
        environment: getStripeEnvironment(),
        returnUrl: `${window.location.origin}/ugc-studio`,
      },
    });
    setPortalLoading(false);
    if (error || !data?.url) {
      toast({
        title: "No pudimos abrir la gestión de tu plan",
        description: data?.error || "Contrata un plan primero o inténtalo de nuevo en un momento.",
        variant: "destructive",
      });
      return;
    }
    window.open(data.url as string, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">Planes mensuales</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada plan incluye un cupo de tokens al mes. 1 token = {formatEur(TOKEN_PRICE_EUR)}.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {UGC_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl border p-6 backdrop-blur-xl ${
                plan.highlight ? "border-primary/50 bg-primary/10" : "border-white/10 bg-card/60"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-[11px] font-medium text-primary-foreground">
                  Recomendado
                </span>
              )}
              <h3 className="font-display text-lg font-bold">{plan.name}</h3>
              <p className="mt-2">
                <span className="font-display text-3xl font-bold">{formatEur(plan.priceEur)}</span>
                <span className="text-sm text-muted-foreground"> /mes</span>
              </p>
              <p className="mt-1 text-sm text-primary">{plan.tokens} tokens incluidos</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {perk}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full rounded-full"
                variant={plan.highlight ? "default" : "outline"}
                onClick={() => buy(plan.priceId, plan.name)}
              >
                Contratar {plan.name}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">Recargas puntuales</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {UGC_TOPUPS.map((pack) => (
            <div key={pack.id} className="rounded-2xl border border-white/10 bg-card/60 p-5">
              <p className="font-display text-2xl font-bold">{pack.tokens}</p>
              <p className="text-xs text-muted-foreground">tokens</p>
              <p className="mt-3 text-sm">{formatEur(pack.priceEur)}</p>
              <Button variant="ghost" size="sm" className="mt-3 rounded-full px-0" onClick={() => buy(pack.priceId, `${pack.tokens} tokens`)}>
                Recargar
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">Cuánto consume cada vídeo</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-card/80 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Calidad</th>
                <th className="px-4 py-3">Duración</th>
                <th className="px-4 py-3">Tokens</th>
                <th className="px-4 py-3">Precio</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLES.map((ex) => {
                const tokens = tokensForVideo(ex.resolution, ex.duration);
                return (
                  <tr key={ex.label} className="border-t border-white/5">
                    <td className="px-4 py-3">{ex.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ex.resolution}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ex.duration}s</td>
                    <td className="px-4 py-3">{tokens}</td>
                    <td className="px-4 py-3">{formatEur(eurFromTokens(tokens))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Consumo por segundo: {Object.entries(TOKENS_PER_SECOND).map(([res, factor]) => `${res} ${factor} tokens/s`).join(" · ")}.
          Si un vídeo falla, sus tokens se devuelven automáticamente.
        </p>
      </div>

      <Dialog open={Boolean(checkout)} onOpenChange={(open) => !open && setCheckout(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{checkout?.label}</DialogTitle>
          </DialogHeader>
          <PaymentTestModeBanner />
          {checkout && <StripeEmbeddedCheckout priceId={checkout.priceId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TariffsPanel;
