import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Laura M.",
    company: "BeautyGlow",
    text: "En 3 meses pasamos de 0 a €120K en ventas mensuales en TikTok Shop. El equipo de TikShopTok nos encontró los productos perfectos y los creadores ideales.",
    result: "€120K/mes",
  },
  {
    name: "Carlos R.",
    company: "FitPro Nutrition",
    text: "La conexión con creadores cambió todo. Antes gastábamos miles en ads sin retorno; ahora cada creador nos genera ventas reales y consistentes.",
    result: "+340% ROI",
  },
  {
    name: "María P.",
    company: "HomeStyle",
    text: "Lanzamos nuestra marca de decoración desde cero con TikShopTok. En 6 semanas teníamos productos virales y una red de 50 creadores activos.",
    result: "50 creadores",
  },
];

const Testimonials = () => (
  <section id="resultados" className="relative py-24">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <p className="text-sm font-medium uppercase tracking-widest text-secondary">
          Resultados
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Lo que dicen nuestros clientes
        </h2>
      </motion.div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-6"
          >
            <div>
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                "{t.text}"
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="font-display text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.company}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 font-display text-sm font-bold text-primary">
                {t.result}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
