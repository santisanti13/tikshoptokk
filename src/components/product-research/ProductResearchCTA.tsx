import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";

const ProductResearchCTA = () => (
  <section className="relative py-24">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-border/50"
      >
        {/* Gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-secondary/15" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-primary/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-secondary/15 blur-[100px]" />

        <div className="relative px-8 py-16 text-center sm:px-16 sm:py-20">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Rocket className="h-4 w-4" />
            Empieza hoy
          </div>

          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold sm:text-4xl">
            ¿Listo para encontrar tu{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              próximo producto ganador
            </span>
            ?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Nuestro equipo de research analiza tu nicho y te entrega un informe
            personalizado con los productos que tienen mayor potencial de ventas
            en TikTok Shop.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 text-base">
              <a href="/#contacto">
                Solicitar investigación
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <a href="/">Volver al inicio</a>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ProductResearchCTA;
