import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Análisis", desc: "Auditamos tu nicho, competencia y oportunidades en TikTok Shop." },
  { num: "02", title: "Setup", desc: "Seleccionamos productos virales con potencial real de ventas." },
  { num: "03", title: "Contenido", desc: "Conectamos con creadores y producimos contenido nativo." },
  { num: "04", title: "Escalado", desc: "Optimizamos, escalamos y multiplicamos ventas medibles." },
];

const Process = () => (
  <section id="proceso" className="px-4 py-24 md:px-8">
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10 text-center"
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">Proceso</p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">Cómo trabajamos</h2>
      </motion.div>

      <div className="bento-solid p-6 md:p-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1;
            return (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div
                  className={`font-display text-5xl font-bold tracking-tighter ${isLast ? "text-primary" : "text-white/20"}`}
                >
                  {s.num}
                </div>
                <h3 className={`mt-3 font-display text-lg font-semibold ${isLast ? "text-primary" : "text-foreground"}`}>
                  {s.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                {!isLast && (
                  <div className="absolute right-0 top-6 hidden h-px w-8 bg-white/10 md:block" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

export default Process;
