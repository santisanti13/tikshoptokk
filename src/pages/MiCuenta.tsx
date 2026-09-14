import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment, paymentsConfigured } from "@/lib/stripe";
import { useSubscription, keepsAccess } from "@/hooks/useSubscription";
import { planForPrice } from "@/lib/planCatalog";
import { formatEur } from "@/lib/ugcPricing";

const fmtDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  trialing: "En prueba",
  past_due: "Pago pendiente",
  canceled: "Cancelado",
  incomplete: "Pago incompleto",
};

const MiCuenta = () => {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const { loading, userEmail, subscriptions, account, active, activePlan, refresh } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (params.get("checkout") === "success") {
      toast({ title: "Pago confirmado", description: "Estamos activando tu plan, puede tardar unos segundos." });
      const t = setTimeout(() => void refresh(), 4000);
      return () => clearTimeout(t);
    }
  }, [params, refresh, toast]);

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

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Mi cuenta — TikShopTok</title>
        <meta name="description" content="Gestiona tu plan, tus tokens y tus facturas de TikShopTok." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-32">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Mi cuenta</h1>
            <p className="mt-2 text-sm text-muted-foreground">{userEmail ?? "—"}</p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={signOut}>
            Cerrar sesión
          </Button>
        </header>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Cargando tu cuenta…</p>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-card/60 p-6">
              <h2 className="font-display text-xl font-bold tracking-tight">Tu plan</h2>
              {active ? (
                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-display text-2xl font-bold">{activePlan?.name ?? active.price_id}</p>
                  {activePlan && <p className="text-muted-foreground">{formatEur(activePlan.priceEur)} al mes</p>}
                  <p>
                    Estado: <span className="text-foreground">{STATUS_LABEL[active.status] ?? active.status}</span>
                  </p>
                  <p className="text-muted-foreground">
                    {active.cancel_at_period_end || active.status === "canceled"
                      ? `Acceso hasta el ${fmtDate(active.current_period_end)}`
                      : `Se renueva el ${fmtDate(active.current_period_end)}`}
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p>Todavía no tienes ningún plan contratado.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" className="rounded-full">
                      <Link to="/ugc-studio">Ver tarifas del estudio</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link to="/contenido-ia">Ver planes de agencia</Link>
                    </Button>
                  </div>
                </div>
              )}

              {paymentsConfigured() && (
                <Button
                  variant="outline"
                  className="mt-5 rounded-full"
                  onClick={openPortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? "Abriendo…" : "Gestionar plan y facturas"}
                </Button>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Desde ahí puedes cambiar de plan, descargar facturas o cancelar. Al cancelar conservas el acceso y los
                tokens hasta el final del periodo ya pagado.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-card/60 p-6">
              <h2 className="font-display text-xl font-bold tracking-tight">Tokens del estudio UGC</h2>
              <p className="mt-4 font-display text-4xl font-bold">{account?.balance_tokens ?? 0}</p>
              <p className="text-sm text-muted-foreground">tokens disponibles</p>
              <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Cupo mensual</dt>
                  <dd>{account?.monthly_tokens ? `${account.monthly_tokens} tokens` : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Próxima recarga</dt>
                  <dd>{fmtDate(account?.renews_at ?? null)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                Los tokens que no gastes se acumulan y no caducan.
              </p>
              <Button asChild className="mt-5 rounded-full">
                <Link to="/ugc-studio">Ir al estudio UGC</Link>
              </Button>
            </section>

            {history.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-card/60 p-6 lg:col-span-2">
                <h2 className="font-display text-xl font-bold tracking-tight">Historial de contrataciones</h2>
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
          </div>
        )}
      </main>
    </div>
  );
};

export default MiCuenta;
