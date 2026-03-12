import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Análisis & Estrategia",
    desc: "Analizamos tu nicho, competencia y oportunidades en TikTok Shop para diseñar la estrategia perfecta.",
  },
  {
    num: "02",
    title: "Selección de Producto",
    desc: "Investigamos y seleccionamos los productos virales con mayor potencial de ventas para tu marca.",
  },
  {
    num: "03",
    title: "Creadores & Contenido",
    desc: "Conectamos tu marca con creadores de contenido ideales y gestionamos toda la producción.",
  },
  {
    num: "04",
    title: "Lanzamiento & Escala",
    desc: "Lanzamos, optimizamos y escalamos tu presencia en TikTok Shop con resultados medibles.",
  },
];

const Process = () => (
  <section id="proceso" className="relative py-24">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <p className="text-sm font-medium uppercase tracking-widest text-secondary">
          Proceso
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Cómo trabajamos
        </h2>
      </motion.div>

      <div className="relative mt-16 grid gap-8 md:grid-cols-4">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="relative text-center"
          >
            <div className="relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {s.num}
              </span>
            </div>
            <h3 className="font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Process;
