import { motion } from "framer-motion";
import { BadgeCheck, Users } from "lucide-react";

const brands = ["Medicube", "Aldous Bio", "MIKOMIKA"];
const creators = ["@belinda", "@diegoxu", "@raquel_twin"];

const BrandsMarquee = () => (
  <section id="marcas" className="px-4 py-20 md:px-8">
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">
          Marcas y creadores
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight md:text-5xl">
          Con quién <span className="gradient-text">trabajamos</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bento bento-hover-cyan relative overflow-hidden p-8 md:col-span-6"
        >
          <div className="neon-blob-cyan -right-10 -top-16 opacity-50" />
          <div className="relative">
            <BadgeCheck className="h-5 w-5 text-secondary" />
            <h3 className="mt-4 font-display text-xl font-bold">Marcas top ventas</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {brands.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-display text-sm font-semibold"
                >
                  {b}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Más de 100.000 productos vendidos gestionando catálogo, feed y contenido de marca.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="bento bento-hover-pink relative overflow-hidden p-8 md:col-span-6"
        >
          <div className="neon-blob-pink -bottom-16 -left-10 opacity-50" />
          <div className="relative">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="mt-4 font-display text-xl font-bold">Creadores afiliados</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {creators.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-primary/25 bg-primary/10 px-4 py-2 font-display text-sm font-semibold text-primary"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Nuestros creadores top facturan entre 50.000 € y 150.000 € al mes desde su propia
              cuenta, con más de 1,2 millones de euros generados en un año.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default BrandsMarquee;
