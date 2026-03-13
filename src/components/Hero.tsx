import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => (
  <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
    {/* Background gradients */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-secondary/15 blur-[120px]" />
    </div>

    <div className="container relative z-10 py-20 text-center lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Agencia #1 en TikTok Shop
        </div>

        <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Lleva tu marca al{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            siguiente nivel
          </span>{" "}
          en TikTok Shop
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Encontramos productos virales, creamos marcas, conectamos con creadores
          y gestionamos toda tu estrategia en TikTok Shop para maximizar tus
          ventas.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2 text-base">
            <a href="#contacto">
              Agenda una consulta
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <a href="#servicios">Ver servicios</a>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4"
      >
        {[
          { value: "Miles de €", label: "En facturación generada" },
          { value: "Top 1", label: "Colaboración con creadores top de España" },
          { value: "5M+", label: "Visitas en contenido con producto a la venta" },
          { value: "30+", label: "Productos lanzados en más de 10 categorías" },
        ].map((s) => (
          <div key={s.label}>
            <p className="font-display text-3xl font-bold text-foreground">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Hero;
