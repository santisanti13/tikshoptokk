import { motion } from "framer-motion";
import { Video, ShoppingBag, LayoutGrid, Users, Search, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: Video,
    title: "Creación de cuentas de contenido",
    description:
      "Abrimos y construimos cuentas desde cero: nicho, personaje, línea visual y publicación diaria hasta que la cuenta crece sola.",
    accent: "secondary",
    span: "md:col-span-7",
  },
  {
    icon: ShoppingBag,
    title: "Cuentas de venta: afiliados y tiendas",
    description:
      "Montamos la cuenta para vender, ya seas afiliado o tienda: catálogo, comisiones, enlaces y contenido que convierte.",
    accent: "primary",
    span: "md:col-span-5",
  },
  {
    icon: LayoutGrid,
    title: "Gestión de tienda, feed y páginas de producto",
    description:
      "Operamos tu TikTok Shop día a día: feed, fichas y páginas de producto, precios, campañas y más de 150 productos lanzados.",
    accent: "primary",
    span: "md:col-span-5",
  },
  {
    icon: Users,
    title: "Red de influencers y afiliados",
    description:
      "Conectamos tu marca con creadores que ya facturan y coordinamos briefings, envíos y calendario de publicación.",
    accent: "secondary",
    span: "md:col-span-7",
  },
  {
    icon: Search,
    title: "Product Research",
    description:
      "Encontramos productos virales y adaptamos la propuesta de valor de otros marketplaces al mercado de TikTok Shop.",
    link: "/product-research",
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
              Lo que hacemos <span className="gradient-text">por ti</span> en TikTok Shop
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
