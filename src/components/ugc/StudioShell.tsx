import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  Clapperboard,
  Images,
  FolderKanban,
  Package,
  CreditCard,
  ChevronLeft,
  Coins,
  User,
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
  { id: "generar", label: "Vídeo", short: "Vídeo", icon: Clapperboard },
  { id: "carruseles", label: "Carruseles", short: "Carrusel", icon: Images },
  { id: "proyectos", label: "Proyectos", short: "Proyectos", icon: FolderKanban },
  { id: "productos", label: "Productos", short: "Productos", icon: Package },
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
          <button
            key={section.id}
            type="button"
            onClick={() => onTab(section.id)}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors ${
              active ? "bg-primary/15 text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="truncate">{section.short}</span>
          </button>
        );
      }
      return (
        <button
          key={section.id}
          type="button"
          onClick={() => onTab(section.id)}
          aria-current={active ? "page" : undefined}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            active
              ? "bg-primary/12 text-foreground ring-1 ring-inset ring-primary/30"
              : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
          }`}
        >
          <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
          <span className="flex-1 text-left">{section.label}</span>
          {typeof count === "number" && count > 0 && (
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
              {count}
            </span>
          )}
        </button>
      );
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* Rail lateral (escritorio) */}
        <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-white/[0.06] bg-[hsl(240_10%_5%)] px-4 py-6 lg:flex">
          <Link to="/" className="flex items-center gap-2 px-2 text-sm font-semibold tracking-tight">
            <span className="font-display">
              Tik<span className="text-primary">Shop</span>Tok
            </span>
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Studio
            </span>
          </Link>

          <nav className="mt-8 space-y-1">
            <NavItems variant="rail" />
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Coins className="h-3.5 w-3.5 text-primary" /> Saldo
              </p>
              <p className="mt-1.5 font-display text-2xl font-bold tabular-nums leading-none">{balanceLabel}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                tokens · {formatEur(eurFromTokens(balance ?? 0))}
              </p>
              <button
                type="button"
                onClick={() => onTab("tarifas")}
                className="mt-3 w-full rounded-lg bg-primary/90 px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary"
              >
                Recargar tokens
              </button>
            </div>

            <Link
              to="/mi-cuenta"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06]">
                <User className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{email || "Mi cuenta"}</span>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Plan {PLAN_LABELS[plan] ?? plan}
                </span>
              </span>
            </Link>

            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Volver a la web
            </Link>
          </div>
        </aside>

        {/* Contenido */}
        <div className="min-w-0 flex-1">
          {/* Barra superior móvil */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden">
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
              <span className="font-display">
                Tik<span className="text-primary">Shop</span>Tok
              </span>
              <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Studio
              </span>
            </Link>
            <button
              type="button"
              onClick={() => onTab("tarifas")}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold tabular-nums"
            >
              <Coins className="h-3.5 w-3.5 text-primary" /> {balanceLabel}
            </button>
          </header>

          {/* Encabezado de sección */}
          <div className="border-b border-white/[0.06] px-4 py-6 lg:px-10 lg:py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h1 className="font-display text-2xl font-bold tracking-tight lg:text-[28px]">{title}</h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
              </div>
              <div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-4 py-2 text-xs lg:flex">
                <Coins className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold tabular-nums">{balanceLabel} tokens</span>
                <span className="text-muted-foreground">· plan {PLAN_LABELS[plan] ?? plan}</span>
              </div>
            </div>
          </div>

          <main className="px-4 pb-32 pt-6 lg:px-10 lg:pb-16 lg:pt-8">{children}</main>
        </div>
      </div>

      {/* Barra inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-0.5 border-t border-white/[0.08] bg-background/95 px-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden">
        <NavItems variant="bar" />
      </nav>
    </div>
  );
};

export default StudioShell;
