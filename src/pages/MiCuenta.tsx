import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment, paymentsConfigured } from "@/lib/stripe";
import { useSubscription, keepsAccess } from "@/hooks/useSubscription";
import { planForPrice } from "@/lib/planCatalog";
import { eurFromTokens, formatEur, videosFromTokens, carouselsFromTokens } from "@/lib/ugcPricing";
import {
  ArrowRight,
  CalendarClock,
  Coins,
  CreditCard,
  Film,
  Images,
  LogOut,
  Receipt,
  Sparkles,
} from "lucide-react";

const fmtDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const fmtDateTime = (value: string) =>
  new Date(value).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  trialing: "En prueba",
  past_due: "Pago pendiente",
  canceled: "Cancelado",
  incomplete: "Pago incompleto",
};

const REASON_LABEL: Record<string, string> = {
  video_generation: "Vídeo generado",
  carousel_generation: "Carrusel generado",
  video_refund: "Devolución por fallo",
  carousel_refund: "Devolución por fallo",
  assistant: "Asistente de guiones",
  admin_adjust: "Ajuste manual",
  plan_grant: "Cupo del plan",
  topup: "Recarga",
  grant: "Tokens añadidos",
};

type LedgerRow = { id: string; delta_tokens: number; reason: string; created_at: string };

/** Tarjeta de dato suelto de la cabecera. */
const StatCard = ({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note?: string;
}) => (
  <div className="rounded-3xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl">
    <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
      {icon} {label}
    </p>
    <p className="mt-3 font-display text-2xl font-bold tracking-tight">{value}</p>
    {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
  </div>
);

const MiCuenta = () => {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const { loading, userEmail, subscriptions, account, active, activePlan, refresh } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);

  const loadLedger = useCallback(async () => {
    const { data } = await supabase
      .from("ugc_token_ledger")
      .select("id, delta_tokens, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(6);
    setLedger((data ?? []) as LedgerRow[]);
  }, []);

  useEffect(() => {
    void loadLedger();
  }, [loadLedger]);

  useEffect(() => {
    if (params.get("checkout") === "success") {
      toast({ title: "Pago confirmado", description: "Estamos activando tu plan, puede tardar unos segundos." });
      const t = setTimeout(() => {
        void refresh();
        void loadLedger();
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [params, refresh, toast, loadLedger]);

  const openPortal = async () => {
    if (!active) {
      toast({
        title: "Todavía no tienes un plan que gestionar",
        description: "Contrata un plan y aquí podrás cambiarlo, ver facturas o cancelarlo.",
      });
      return;
    }
    setPortalLoading(true);
    const { data, error } = await supabase.functions.invoke("create-portal-session", {
      body: { environment: getStripeEnvironment(), returnUrl: `${window.location.origin}/mi-cuenta` },
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

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const history = subscriptions.filter((s) => s.id !== active?.id);
  const balance = account?.balance_tokens ?? 0;
  const monthly = account?.monthly_tokens ?? 0;
  const usedRatio = monthly > 0 ? Math.min(100, Math.round((balance / monthly) * 100)) : 0;
  const initial = (userEmail ?? "?").charAt(0).toUpperCase();
  const canceling = Boolean(active && (active.cancel_at_period_end || active.status === "canceled"));

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Mi cuenta — TikShopTok</title>
        <meta name="description" content="Gestiona tu plan, tus tokens y tus facturas de TikShopTok." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-32 md:px-8">
        {/* Cabecera con identidad y estado del plan */}
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-card/60 p-6 backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary font-display text-xl font-bold text-primary-foreground">
                {initial}
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Mi cuenta</h1>
                <p className="truncate text-sm text-muted-foreground">{userEmail ?? "—"}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-background/50 px-3 py-1 text-xs">
                  <Sparkles className="h-3 w-3 text-primary" />
                  {active
                    ? `${activePlan?.name ?? active.price_id} · ${STATUS_LABEL[active.status] ?? active.status}`
                    : "Sin plan contratado"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="rounded-full">
                <Link to="/ugc-studio">
                  Ir al estudio <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              {paymentsConfigured() && (
                <Button variant="outline" className="rounded-full" onClick={openPortal} disabled={portalLoading}>
                  <CreditCard className="mr-1.5 h-4 w-4" />
                  {portalLoading ? "Abriendo…" : "Plan y facturas"}
                </Button>
              )}
              <Button variant="ghost" className="rounded-full text-muted-foreground" onClick={signOut}>
                <LogOut className="mr-1.5 h-4 w-4" /> Salir
              </Button>
            </div>
          </div>
        </header>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Cargando tu cuenta…</p>
        ) : (
          <>
            {/* Datos de un vistazo */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Coins className="h-3.5 w-3.5 text-primary" />}
                label="Saldo"
                value={`${balance} tokens`}
                note={`Equivale a ${formatEur(eurFromTokens(balance))}`}
              />
              <StatCard
                icon={<Film className="h-3.5 w-3.5 text-primary" />}
                label="Te da para"
                value={`${videosFromTokens(balance)} vídeos`}
                note={`o ${carouselsFromTokens(balance)} carruseles`}
              />
              <StatCard
                icon={<CalendarClock className="h-3.5 w-3.5 text-primary" />}
                label={canceling ? "Acceso hasta" : "Próxima recarga"}
                value={fmtDate(active?.current_period_end ?? account?.renews_at ?? null)}
                note={monthly > 0 ? `Cupo mensual: ${monthly} tokens` : "Sin cupo mensual todavía"}
              />
              <StatCard
                icon={<Receipt className="h-3.5 w-3.5 text-primary" />}
                label="Cuota"
                value={activePlan ? `${formatEur(activePlan.priceEur)}` : "—"}
                note={activePlan?.recurring ? "al mes" : active ? "pago único" : "sin plan activo"}
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              {/* Tokens con barra de consumo */}
              <section className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-bold tracking-tight">Tokens del estudio</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Los tokens que no gastes se acumulan y no caducan.
                    </p>
                  </div>
                  <p className="font-display text-4xl font-bold leading-none">{balance}</p>
                </div>

                {monthly > 0 && (
                  <div className="mt-5">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${usedRatio}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {balance} de {monthly} tokens del cupo de este ciclo
                    </p>
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <Film className="h-3.5 w-3.5 text-primary" /> Un vídeo de 8s
                    </p>
                    <p className="mt-1 text-sm">12 tokens · {formatEur(eurFromTokens(12))}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <Images className="h-3.5 w-3.5 text-primary" /> Un carrusel
                    </p>
                    <p className="mt-1 text-sm">3 tokens · {formatEur(eurFromTokens(3))}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button asChild size="sm" className="rounded-full">
                    <Link to="/ugc-studio">Crear contenido</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link to="/ugc-studio">Recargar tokens</Link>
                  </Button>
                </div>
              </section>

              {/* Plan activo o invitación a contratar */}
              <section className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
                <h2 className="font-display text-lg font-bold tracking-tight">Tu plan</h2>

                {active ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="font-display text-2xl font-bold tracking-tight">
                        {activePlan?.name ?? active.price_id}
                      </p>
                      {activePlan && (
                        <p className="text-sm text-muted-foreground">
                          {formatEur(activePlan.priceEur)} {activePlan.recurring ? "al mes" : "pago único"}
                          {activePlan.tokens ? ` · ${activePlan.tokens} tokens incluidos` : ""}
                        </p>
                      )}
                    </div>

                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4 border-t border-white/10 pt-2">
                        <dt className="text-muted-foreground">Estado</dt>
                        <dd>{STATUS_LABEL[active.status] ?? active.status}</dd>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-white/10 pt-2">
                        <dt className="text-muted-foreground">{canceling ? "Acceso hasta" : "Se renueva el"}</dt>
                        <dd>{fmtDate(active.current_period_end)}</dd>
                      </div>
                    </dl>

                    <p className="text-xs text-muted-foreground">
                      Al cancelar conservas el acceso y los tokens hasta el final del periodo ya pagado.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Todavía no tienes ningún plan. Puedes seguir usando tus tokens de prueba o elegir un plan cuando
                      quieras.
                    </p>
                    <div className="space-y-2">
                      <Link
                        to="/contenido-ia"
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-background/40 p-4 transition-colors hover:border-primary/50"
                      >
                        <span>
                          <span className="block text-sm font-medium">Estudio para hacerlo tú</span>
                          <span className="block text-xs text-muted-foreground">Desde 24,90 € al mes</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </Link>
                      <Link
                        to="/contenido-ia"
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-background/40 p-4 transition-colors hover:border-primary/50"
                      >
                        <span>
                          <span className="block text-sm font-medium">Que lo hagamos nosotros</span>
                          <span className="block text-xs text-muted-foreground">Planes de agencia desde 690 €</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </Link>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Movimientos de tokens */}
            {ledger.length > 0 && (
              <section className="mt-6 rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
                <h2 className="font-display text-lg font-bold tracking-tight">Últimos movimientos</h2>
                <ul className="mt-4 divide-y divide-white/10 text-sm">
                  {ledger.map((row) => (
                    <li key={row.id} className="flex items-center justify-between gap-4 py-3">
                      <span className="min-w-0">
                        <span className="block truncate">{REASON_LABEL[row.reason] ?? row.reason}</span>
                        <span className="block text-xs text-muted-foreground">{fmtDateTime(row.created_at)}</span>
                      </span>
                      <span className={row.delta_tokens < 0 ? "text-muted-foreground" : "text-primary"}>
                        {row.delta_tokens > 0 ? "+" : ""}
                        {row.delta_tokens} tokens
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Historial de contrataciones */}
            {history.length > 0 && (
              <section className="mt-6 rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
                <h2 className="font-display text-lg font-bold tracking-tight">Historial de contrataciones</h2>
                <ul className="mt-4 divide-y divide-white/10 text-sm">
                  {history.map((row) => (
                    <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <span>{planForPrice(row.price_id)?.name ?? row.price_id}</span>
                      <span className="text-muted-foreground">
                        {STATUS_LABEL[row.status] ?? row.status}
                        {keepsAccess(row) ? " · con acceso" : ""} · hasta {fmtDate(row.current_period_end)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MiCuenta;
