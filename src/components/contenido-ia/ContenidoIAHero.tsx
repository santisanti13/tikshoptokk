import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Video,
  Bot,
  CalendarClock,
  Target,
  UserRound,
  Clapperboard,
  Send,
  ChartNoAxesCombined,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const workflow = [
  { icon: Target, step: "01", title: "Estrategia", detail: "Nicho, producto y ángulos" },
  { icon: UserRound, step: "02", title: "Personaje o UGC", detail: "Identidad, voz y formato" },
  { icon: Clapperboard, step: "03", title: "Producción IA", detail: "Guiones y vídeos diarios" },
  { icon: Send, step: "04", title: "Publicación", detail: "Cuenta, catálogo y enlaces" },
  { icon: ChartNoAxesCombined, step: "05", title: "Optimización", detail: "Hooks, ventas y escala" },
];

const resultMetrics = [
  { label: "GMV", value: "1.547,00 €" },
  { label: "Pedidos", value: "86" },
  { label: "Producto", value: "1.260,40 €" },
  { label: "Afiliados", value: "286,60 €" },
];

const ContenidoIAHero = () => {
  const navigate = useNavigate();
  const goToContact = () => {
    navigate("/");
    setTimeout(() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" }), 300);
  };

  const metrics = [
    { icon: Video, value: "150+", label: "Vídeos IA al mes por cuenta", accent: "secondary" as const },
    { icon: Bot, value: "48 h", label: "Primera entrega de contenido", accent: "primary" as const },
    { icon: CalendarClock, value: "Diario", label: "Publicación sin parar", accent: "secondary" as const },
  ];

  return (
    <section className="px-4 pt-28 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento relative overflow-hidden p-8 md:col-span-8 md:p-12"
        >
          <div className="neon-blob-pink -right-10 -top-10 opacity-70" />
          <div className="neon-blob-cyan -bottom-20 -left-10 opacity-40" />
          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-secondary">
              <Sparkles className="h-4 w-4" /> Estudio de contenido · software
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Tu propio estudio de <span className="gradient-text">UGC con IA</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Elige un estilo, sube tu producto o tu personaje y genera vídeos listos para publicar
              en minutos. Sin grabar, sin equipo y pagando solo por lo que generas. Y si prefieres
              que lo hagamos nosotros, la agencia se encarga de todo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-8 glow-cyan">
                <a href="#planes">
                  Empezar ahora <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-transparent px-8 hover:bg-white/5">
                <Link to="/login?as=studio">Entrar al estudio</Link>
              </Button>
              <Button size="lg" variant="ghost" className="rounded-full px-6" onClick={goToContact}>
                Prefiero que lo hagáis vosotros
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-solid bento-hover-cyan flex flex-col justify-center gap-8 p-8 md:col-span-4"
        >
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">Coste por vídeo</div>
          <div>
            <div className="font-display text-5xl font-bold tracking-tighter text-secondary md:text-6xl">-90%</div>
            <div className="mt-1 font-medium">frente a un creador tradicional</div>
            <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[90%] bg-secondary" />
            </div>
          </div>
        </motion.div>

        {metrics.map((m, i) => {
          const isPink = m.accent === "primary";
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className={`bento ${isPink ? "bento-hover-pink" : "bento-hover-cyan"} p-6 md:col-span-4`}
            >
              <m.icon className={`h-5 w-5 ${isPink ? "text-primary" : "text-secondary"}`} />
              <p className="mt-4 font-display text-3xl font-bold">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.label}</p>
            </motion.div>
          );
        })}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bento relative overflow-hidden p-6 md:col-span-12 md:p-10"
        >
          <div className="neon-blob-cyan -right-16 top-1/3 opacity-30" />
          <div className="relative">
            <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">Nuestro workflow</p>
                <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold md:text-4xl">
                  De una idea a <span className="gradient-text">ventas medibles</span>
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Creamos el sistema completo: concepto, contenido, publicación y mejora continua según resultados.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {workflow.map((item, index) => (
                <div
                  key={item.step}
                  className="group relative min-h-36 rounded-lg border border-border bg-card/70 p-4 transition-colors hover:border-secondary/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary/10 text-secondary">
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-display text-xs font-semibold text-muted-foreground">{item.step}</span>
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                  {index < workflow.length - 1 && (
                    <ArrowRight className="absolute -right-2.5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-background p-1 text-primary lg:block" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
              <div className="relative mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-lg border border-border bg-card lg:mx-0 lg:max-w-none">
                <iframe
                  src="https://www.tiktok.com/player/v1/7597044434647174422?autoplay=1&loop=1&mute=1&controls=0"
                  className="h-full w-full border-0"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                  loading="lazy"
                  title="Ejemplo de contenido creado para TikTok Shop"
                />
                <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-md border border-border bg-background/90 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-widest backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Pieza publicada
                </div>
              </div>

              <div className="relative overflow-hidden rounded-lg border border-border bg-card p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Centro de datos · Ventas</p>
                    <h3 className="mt-1 font-display text-xl font-semibold">Rendimiento de la cuenta</h3>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>

                <div className="py-7">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">GMV total</p>
                      <p className="mt-1 font-display text-4xl font-bold text-foreground sm:text-5xl">1.547,00 €</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-secondary/10 px-3 py-2 text-sm font-semibold text-secondary">
                      <TrendingUp className="h-4 w-4" aria-hidden="true" /> +38,6%
                    </div>
                  </div>
                  <div className="mt-7 flex h-24 items-end gap-2" aria-hidden="true">
                    {[28, 42, 35, 58, 48, 70, 62, 84, 76, 96].map((height, index) => (
                      <div key={`${height}-${index}`} className="flex-1 rounded-t bg-secondary/20" style={{ height: `${height}%` }}>
                        <div className="h-1.5 w-full rounded bg-secondary" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
                  {resultMetrics.map((metric) => (
                    <div key={metric.label} className="bg-card p-4">
                      <p className="text-[11px] text-muted-foreground">{metric.label}</p>
                      <p className="mt-1 font-display text-sm font-semibold sm:text-base">{metric.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
                  Muestra visual de un resultado de campaña. El rendimiento varía según producto, cuenta y mercado.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContenidoIAHero;
