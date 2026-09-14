import { motion } from "framer-motion";
import { Search, Palette, Users, Link2, Sparkles, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: Search,
    title: "Product Research",
    description:
      "Encontramos productos virales y adaptamos la propuesta de valor de otros marketplaces al mercado de TikTok Shop.",
    link: "/product-research",
    accent: "secondary",
    span: "md:col-span-8",
  },
  {
    icon: Palette,
    title: "Creación de Marcas",
    description:
      "Estructuramos y lanzamos marcas nativas TikTok. Identidad y posicionamiento listos para escalar.",
    accent: "primary",
    span: "md:col-span-4",
  },
  {
    icon: Users,
    title: "Gestión de Creadores",
    description:
      "Dirigimos, planificamos y coordinamos creadores. Consejos, agendas y planificación para resultados consistentes.",
    accent: "secondary",
    span: "md:col-span-4",
  },
  {
    icon: Link2,
    title: "Conexión Marca-Creador",
    description:
      "Conectamos marcas con los creadores ideales para maximizar resultados y generar ventas reales.",
    accent: "primary",
    span: "md:col-span-8",
  },
  {
    icon: Sparkles,
    title: "Cuentas y UGC con IA",
    description:
      "Creamos personajes con IA, lanzamos cuentas desde cero y producimos contenido diario para tu perfil o tu ecommerce.",
    link: "/contenido-ia",
    accent: "secondary",
    span: "md:col-span-12",
  },
];

const Services = () => {
  const navigate = useNavigate();

  return (
    <section id="servicios" className="px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">Servicios</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight md:text-5xl">
              Todo lo que necesitas para <span className="gradient-text">triunfar</span> en TikTok Shop
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {services.map((s, i) => {
            const isPink = s.accent === "primary";
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => s.link && navigate(s.link)}
                className={`bento ${isPink ? "bento-hover-pink" : "bento-hover-cyan"} group relative overflow-hidden p-8 ${s.span} ${s.link ? "cursor-pointer" : ""}`}
              >
                <div
                  className={`absolute -right-10 -top-10 h-40 w-40 rounded-full blur-[80px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${isPink ? "bg-primary/30" : "bg-secondary/30"}`}
                />
                <div className="relative flex h-full flex-col">
                  <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${isPink ? "bg-primary/15" : "bg-secondary/15"}`}>
                    <s.icon className={`h-6 w-6 ${isPink ? "text-primary" : "text-secondary"}`} />
                  </div>
                  <h3 className="font-display text-2xl font-bold">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                  {s.link && (
                    <div className={`mt-6 inline-flex items-center gap-1 text-sm font-medium ${isPink ? "text-primary" : "text-secondary"}`}>
                      Ver más
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
