import { motion } from "framer-motion";
import { Target, Zap, Shield, Eye, TrendingUp, BarChart } from "lucide-react";

const features = [
  { icon: Target, title: "Detección de Nichos Rentables", description: "Identificamos nichos con alta demanda y baja competencia. Analizamos saturación vs oportunidad para encontrar el punto dulce." },
  { icon: Zap, title: "Análisis de Viralidad", description: "Medimos el potencial viral según engagement, shares y velocidad de crecimiento de ventas." },
  { icon: Eye, title: "Monitoreo de Competencia", description: "Rastreamos qué venden los top sellers, su pricing y cómo posicionan con creadores." },
  { icon: Shield, title: "Validación de Proveedores", description: "Verificamos disponibilidad, calidad y márgenes con proveedores en 1688, Alibaba y fabricantes directos." },
  { icon: TrendingUp, title: "Predicción de Tendencias", description: "Cruzamos datos de TikTok, Google Trends y Amazon para anticipar qué productos van a explotar." },
  { icon: BarChart, title: "Reportes de Métricas", description: "Cada producto con informe completo: ventas, margen, CAC y ROI proyectado." },
];

const ProductResearchService = () => (
  <section className="px-4 py-24 md:px-8">
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">Nuestro proceso</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
          Investigación de productos con <span className="gradient-text">datos reales</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((f, i) => {
          const isPink = i % 2 === 0;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`bento ${isPink ? "bento-hover-pink" : "bento-hover-cyan"} p-7`}
            >
              <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${isPink ? "bg-primary/15" : "bg-secondary/15"}`}>
                <f.icon className={`h-5 w-5 ${isPink ? "text-primary" : "text-secondary"}`} />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default ProductResearchService;
