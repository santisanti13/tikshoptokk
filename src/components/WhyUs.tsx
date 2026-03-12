import { motion } from "framer-motion";
import { TrendingUp, Shield, Zap, Target } from "lucide-react";

const points = [
  {
    icon: TrendingUp,
    title: "Expertos en TikTok Shop",
    desc: "Equipo 100% especializado en la plataforma con años de experiencia en social commerce.",
  },
  {
    icon: Target,
    title: "Productos con demanda real",
    desc: "Nuestro research se basa en datos, tendencias virales y validación de mercado real.",
  },
  {
    icon: Zap,
    title: "Resultados rápidos",
    desc: "Procesos optimizados para que tu marca empiece a vender en semanas, no en meses.",
  },
  {
    icon: Shield,
    title: "Gestión integral",
    desc: "Desde el producto hasta el creador, gestionamos todo para que tú solo veas los resultados.",
  },
];

const WhyUs = () => (
  <section id="porqué" className="relative py-24">
    <div className="container">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            ¿Por qué TikShopTok?
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Tu partner estratégico en TikTok Shop
          </h2>
          <p className="mt-4 text-muted-foreground">
            No somos una agencia genérica. Somos especialistas en TikTok Shop
            con un ecosistema completo: desde el research de producto hasta la
            gestión de creadores y la conexión con marcas.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          {points.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p.icon className="mb-3 h-5 w-5 text-secondary" />
              <h3 className="font-display text-base font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default WhyUs;
