import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Users, Zap } from "lucide-react";

const Hero = () => (
  <section className="relative overflow-hidden px-4 pt-24 md:px-8 md:pt-28">
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-12">
      {/* Hero block */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bento bento-hover-pink group relative flex min-h-[460px] flex-col justify-center overflow-hidden p-8 md:col-span-8 md:p-12"
      >
        <div className="neon-blob-pink -right-10 -top-10 opacity-60 transition-opacity group-hover:opacity-90" />
        <div className="neon-blob-cyan -bottom-20 -left-10 opacity-30" />

        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-secondary">
            <Sparkles className="h-4 w-4" />
            Agencia #1 en TikTok Shop
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Domina el <span className="gradient-text">Social Commerce</span> en TikTok Shop
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Encontramos productos virales, creamos marcas y conectamos con creadores para escalar
            tus ventas a escala industrial.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-8 glow-pink">
              <a href="#contacto">
                Empezar ahora
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-transparent px-8 hover:bg-white/5">
              <a href="#servicios">Ver servicios</a>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main stat tile */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bento-solid bento-hover-cyan flex flex-col justify-center gap-8 p-8 md:col-span-4"
      >
        <div>
          <div className="mb-4 flex -space-x-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-12 w-12 rounded-full border-2 border-[hsl(240_8%_7%)] bg-gradient-to-br from-primary/40 to-secondary/40"
              />
            ))}
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[hsl(240_8%_7%)] bg-secondary text-xs font-bold text-secondary-foreground">
              +50
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Impulsando a los mejores creadores top de España</p>
        </div>
        <div>
          <div className="font-display text-5xl font-bold tracking-tighter text-secondary md:text-6xl">+5M</div>
          <div className="mt-1 font-medium text-foreground/80">Visitas en contenido con producto</div>
        </div>
      </motion.div>

      {/* Stat row */}
      {[
        { icon: TrendingUp, value: "Miles de €", label: "Facturación generada", accent: "text-primary" },
        { icon: Users, value: "Top 1", label: "Creadores top de España", accent: "text-secondary" },
        { icon: Zap, value: "30+", label: "Productos lanzados", accent: "text-primary" },
        { icon: Sparkles, value: "10+", label: "Categorías dominadas", accent: "text-secondary" },
      ].map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + i * 0.06 }}
          className="bento flex flex-col justify-between p-6 md:col-span-3"
        >
          <s.icon className={`h-5 w-5 ${s.accent}`} />
          <div className="mt-4">
            <p className="font-display text-3xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default Hero;
