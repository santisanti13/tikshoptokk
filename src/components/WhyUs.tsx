import { motion } from "framer-motion";
import { TrendingUp, Shield, Zap, Target } from "lucide-react";

const points = [
  { icon: TrendingUp, title: "Expertos en TikTok Shop", desc: "Equipo 100% especializado en la plataforma con experiencia probada en social commerce." },
  { icon: Target, title: "Productos con demanda real", desc: "Research basado en datos, tendencias virales y validación de mercado." },
  { icon: Zap, title: "Resultados rápidos", desc: "Procesos optimizados para empezar a vender en semanas, no en meses." },
  { icon: Shield, title: "Gestión integral", desc: "Desde producto hasta creador: tú solo ves los resultados." },
];

const WhyUs = () => (
  <section id="porqué" className="px-4 py-24 md:px-8">
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bento relative overflow-hidden p-8 md:col-span-5 md:p-10"
      >
        <div className="neon-blob-cyan -bottom-10 -left-10 opacity-60" />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">¿Por qué TikShopTok?</p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Tu partner <span className="gradient-text">estratégico</span> en TikTok Shop
          </h2>
          <p className="mt-6 text-muted-foreground">
            No somos una agencia genérica. Somos especialistas en TikTok Shop con un
            ecosistema completo: research, creación, gestión de creadores y conexión con marcas.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-7">
        {points.map((p, i) => {
          const isCyan = i % 2 === 0;
          return (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`bento-solid ${isCyan ? "bento-hover-cyan" : "bento-hover-pink"} p-6`}
            >
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${isCyan ? "bg-secondary/15" : "bg-primary/15"}`}>
                <p.icon className={`h-5 w-5 ${isCyan ? "text-secondary" : "text-primary"}`} />
              </div>
              <h3 className="font-display text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default WhyUs;
