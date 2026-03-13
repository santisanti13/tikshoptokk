import { motion } from "framer-motion";
import { Search, Palette, Users, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: Search,
    title: "Product Research",
    description:
      "Encontramos productos virales y adaptamos la propuesta de valor de otros marketplaces y e-commerce al mercado de TikTok Shop.",
    link: "/product-research",
  },
  {
    icon: Palette,
    title: "Creación de Marcas",
    description:
      "Estructuramos y lanzamos marcas optimizadas para TikTok Shop. Creamos toda la identidad y estrategia de posicionamiento.",
  },
  {
    icon: Users,
    title: "Gestión de Creadores",
    description:
      "Dirigimos, planificamos y coordinamos creadores de contenido. Consejos, agendas y planificación para resultados consistentes.",
  },
  {
    icon: Link2,
    title: "Conexión Marca-Creador",
    description:
      "Conectamos marcas con creadores de contenido ideales para maximizar resultados y conseguir ventas reales de sus productos.",
  },
];

const Services = () => (
  <section id="servicios" className="relative py-24">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Servicios
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Todo lo que necesitas para triunfar en TikTok Shop
        </h2>
      </motion.div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
              <s.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {s.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Services;
