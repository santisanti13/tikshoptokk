import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Clapperboard,
  UserRound,
  Package,
  CreditCard,
  ChevronLeft,
  Coins,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import { eurFromTokens, formatEur } from "@/lib/ugcPricing";

export type StudioSection = {
  id: string;
  label: string;
  short: string;
  icon: typeof Upload;
  count?: number;
};

export const STUDIO_SECTIONS: Omit<StudioSection, "count">[] = [
  { id: "captura", label: "Sube tu captura", short: "Captura", icon: Upload },
  { id: "generar", label: "Crear", short: "Crear", icon: Clapperboard },
  { id: "productos", label: "Productos", short: "Productos", icon: Package },
  { id: "avatares", label: "Avatares", short: "Avatares", icon: UserRound },
  { id: "tarifas", label: "Plan y tokens", short: "Plan", icon: CreditCard },
];

type Props = {
  tab: string;
  onTab: (tab: string) => void;
  balance: number | null;
  plan: string;
  counts?: Record<string, number>;
  title: string;
  subtitle: string;
  children: ReactNode;
};

const PLAN_LABELS: Record<string, string> = {
  trial: "Prueba",
  arranque: "Arranque",
  starter: "Starter",
  pro: "Pro",
  studio: "Studio",
};

const StudioShell = ({ tab, onTab, balance, plan, counts, title, subtitle, children }: Props) => {
  const [email, setEmail] = useState<string>("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    });
  }, []);

  const balanceLabel = balance === null ? "—" : balance.toLocaleString("es-ES");

  const NavItems = ({ variant }: { variant: "rail" | "bar" }) =>
    STUDIO_SECTIONS.map((section) => {
      const Icon = section.icon;
      const active = tab === section.id;
      const count = counts?.[section.id];
      if (variant === "bar") {
        return (
          <Button
            key={section.id}
            type="button"
            variant="ghost"
            onClick={() => onTab(section.id)}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors ${
              active ? "bg-primary/15 text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="truncate">{section.short}</span>
          </Button>
        );
      }
      return (
        <Button
          key={section.id}
          type="button"
          variant="ghost"
          onClick={() => onTab(section.id)}
          aria-current={active ? "page" : undefined}
          title={collapsed ? section.label : undefined}
          className={`group flex h-10 w-full items-center rounded-md px-3 text-sm font-medium transition-colors ${
            active
              ? "bg-primary/10 text-foreground ring-1 ring-inset ring-primary/25"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
          {!collapsed && <span className="flex-1 text-left">{section.label}</span>}
          {!collapsed && typeof count === "number" && count > 0 && (
            <span className="rounded bg-muted px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
              {count}
            </span>
          )}
        </Button>
      );
    });

  return (
    <div className="studio-theme min-h-screen bg-background text-foreground">
      <div className="flex w-full">
        {/* Rail lateral (escritorio) */}
        <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card/60 px-3 py-5 backdrop-blur-xl transition-[width] duration-200 lg:flex ${collapsed ? "w-[76px]" : "w-[248px]"}`}>
          <div className="flex h-11 items-center justify-between gap-2 px-2">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              {!collapsed && (
                <span className="min-w-0">
                  <span className="block truncate font-display text-xl leading-none">TikShopTok</span>
                  <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">UGC Creator</span>
                </span>
              )}
            </Link>
            {!collapsed && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setCollapsed(true)} aria-label="Contraer navegación">
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}
          </div>
          {collapsed && (
            <Button variant="ghost" size="icon" className="mx-auto mt-2 h-8 w-8 text-muted-foreground" onClick={() => setCollapsed(false)} aria-label="Expandir navegación">
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          )}

          <p className={`mb-3 mt-8 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground ${collapsed ? "sr-only" : ""}`}>Espacio de trabajo</p>
          <nav className="space-y-1">
            <NavItems variant="rail" />
          </nav>

          <div className="mt-auto space-y-3">
            <div className={`rounded-lg border border-border bg-muted/25 ${collapsed ? "p-2" : "p-4"}`}>
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Coins className="h-3.5 w-3.5 text-primary" /> Saldo
              </p>
              <p className={`mt-1.5 font-display tabular-nums leading-none ${collapsed ? "text-lg" : "text-3xl"}`}>{balanceLabel}</p>
              {!collapsed && <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                tokens · {formatEur(eurFromTokens(balance ?? 0))}
              </p>}
              <Button
                type="button"
                onClick={() => onTab("tarifas")}
                className={`mt-3 h-8 w-full rounded-md px-2 text-xs font-semibold ${collapsed ? "text-[0px]" : ""}`}
                title="Recargar tokens"
              >
                {collapsed ? <Coins className="h-4 w-4" /> : "Recargar tokens"}
              </Button>
            </div>

            <Link
              to="/mi-cuenta"
              className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted">
                <User className="h-3.5 w-3.5" />
              </span>
              {!collapsed && <span className="min-w-0 flex-1">
                <span className="block truncate">{email || "Mi cuenta"}</span>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Plan {PLAN_LABELS[plan] ?? plan}
                </span>
              </span>}
            </Link>

            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> {!collapsed && "Volver a la web"}
            </Link>
          </div>
        </aside>

        {/* Contenido */}
        <div className="min-w-0 flex-1">
          {/* Barra superior móvil */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground"><Sparkles className="h-3.5 w-3.5" /></span>
              <span className="font-display text-lg">TikShopTok</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-primary">
                Creator
              </span>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onTab("tarifas")}
              className="h-8 rounded-md px-3 text-xs font-semibold tabular-nums"
            >
              <Coins className="h-3.5 w-3.5 text-primary" /> {balanceLabel}
            </Button>
          </header>

          {/* Encabezado de sección */}
          <div className="border-b border-border px-4 py-6 lg:px-8 lg:py-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">UGC Creator · TikTok Shop</p>
                <h1 className="font-display text-3xl leading-none lg:text-4xl">{title}</h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
              </div>
              <div className="hidden shrink-0 items-center gap-2 rounded-md border border-border bg-muted/25 px-4 py-2 text-xs lg:flex">
                <Coins className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold tabular-nums">{balanceLabel} tokens</span>
                <span className="text-muted-foreground">· plan {PLAN_LABELS[plan] ?? plan}</span>
              </div>
            </div>
          </div>

          <main className="px-4 pb-32 pt-6 lg:px-8 lg:pb-16 lg:pt-8">{children}</main>
        </div>
      </div>

      {/* Barra inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-0.5 border-t border-border bg-background/95 px-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden">
        <NavItems variant="bar" />
      </nav>
    </div>
  );
};

export default StudioShell;
