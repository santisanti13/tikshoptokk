import { motion } from "framer-motion";
import { Target, Zap, Shield, Eye, TrendingUp, BarChart } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Detección de Nichos Rentables",
    description:
      "Identificamos nichos con alta demanda y baja competencia en TikTok Shop. Analizamos el ratio de saturación vs oportunidad para encontrar el punto dulce.",
  },
  {
    icon: Zap,
    title: "Análisis de Viralidad",
    description:
      "Medimos el potencial viral de cada producto basándonos en engagement rates, shares y velocidad de crecimiento de ventas en las últimas semanas.",
  },
  {
    icon: Eye,
    title: "Monitoreo de Competencia",
    description:
      "Rastreamos qué están vendiendo los top sellers, sus estrategias de pricing y cómo posicionan sus productos con creadores de contenido.",
  },
  {
    icon: Shield,
    title: "Validación de Proveedores",
    description:
      "Verificamos la disponibilidad, calidad y márgenes de beneficio de cada producto con proveedores en 1688, Alibaba y fabricantes directos.",
  },
  {
    icon: TrendingUp,
    title: "Predicción de Tendencias",
    description:
      "Nuestro sistema cruza datos de TikTok, Google Trends y Amazon para predecir qué productos van a explotar en las próximas semanas.",
  },
  {
    icon: BarChart,
    title: "Reportes de Métricas",
    description:
      "Cada producto viene con un informe completo: ventas estimadas, margen de beneficio, coste de adquisición de cliente y ROI proyectado.",
  },
];

const ProductResearchService = () => (
  <section className="relative py-24">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[120px]" />
    </div>

    <div className="container relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Nuestro Proceso
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Investigación de productos con{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            datos reales
          </span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          No adivinamos. Analizamos datos reales de ventas, engagement y
          tendencias para recomendarte los productos con mayor probabilidad de
          éxito en TikTok Shop.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/80"
          >
            {/* Gradient hover effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-3">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProductResearchService;
