import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Laura M.",
    company: "BeautyGlow",
    text: "En 3 meses pasamos de 0 a €120K en ventas mensuales en TikTok Shop. TikShopTok nos encontró los productos perfectos y los creadores ideales.",
    result: "€120K/mes",
    span: "md:col-span-5",
  },
  {
    name: "Carlos R.",
    company: "FitPro Nutrition",
    text: "La conexión con creadores cambió todo. Antes gastábamos miles en ads sin retorno; ahora cada creador nos genera ventas reales.",
    result: "+340% ROI",
    span: "md:col-span-4",
  },
  {
    name: "María P.",
    company: "HomeStyle",
    text: "Lanzamos nuestra marca de decoración desde cero. En 6 semanas teníamos productos virales y una red de 50 creadores activos.",
    result: "50 creadores",
    span: "md:col-span-3",
  },
];

const Testimonials = () => (
  <section id="resultados" className="px-4 py-24 md:px-8">
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10 text-center"
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">Resultados</p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Lo que dicen <span className="gradient-text">nuestros clientes</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`bento bento-hover-pink relative flex flex-col justify-between overflow-hidden p-8 ${t.span}`}
          >
            <Quote className="absolute right-6 top-6 h-10 w-10 text-primary/15" />
            <div>
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-base leading-relaxed text-foreground/90">"{t.text}"</p>
            </div>
            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-4">
              <div>
                <p className="font-display text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.company}</p>
              </div>
              <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 font-display text-sm font-bold text-secondary">
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
