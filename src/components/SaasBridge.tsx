import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2, Clock, Coins } from "lucide-react";

const features = [
  { icon: Wand2, title: "Presets de UGC", desc: "Cara, cuerpo completo, POV, unboxing, demo o voz en off." },
  { icon: Clock, title: "Vídeo en minutos", desc: "Escribes o generas el guion y la IA lo graba por ti." },
  { icon: Coins, title: "Pagas por uso", desc: "Tokens: gastas solo los segundos que generas." },
];

const SaasBridge = () => (
  <section id="estudio" className="px-4 py-24 md:px-8">
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bento-solid bento-hover-cyan relative overflow-hidden p-8 md:p-12"
      >
        <div className="neon-blob-cyan -right-10 -top-16 opacity-60" />
        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">
              Software · hazlo tú mismo
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              El estudio de contenido de <span className="gradient-text">TikShopTok</span>
            </h2>
            <p className="mt-5 max-w-lg text-muted-foreground">
              La misma máquina de contenido que usamos en la agencia, abierta para que la uses tú.
              Crea tus personajes, sube tu producto y genera vídeos UGC con IA sin grabar nada.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-8 glow-cyan">
                <Link to="/contenido-ia">
                  Ver el estudio y precios
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-transparent px-8 hover:bg-white/5">
                <Link to="/login?as=studio">Entrar al estudio</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {features.map((f) => (
              <div key={f.title} className="bento p-6">
                <f.icon className="h-5 w-5 text-secondary" />
                <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default SaasBridge;
