import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Video, Bot, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContenidoIAHero = () => {
  const navigate = useNavigate();
  const goToContact = () => {
    navigate("/");
    setTimeout(() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" }), 300);
  };

  const metrics = [
    { icon: Video, value: "150+", label: "Vídeos IA al mes por cuenta", accent: "secondary" as const },
    { icon: Bot, value: "48 h", label: "Primera entrega de contenido", accent: "primary" as const },
    { icon: CalendarClock, value: "Diario", label: "Publicación sin parar", accent: "secondary" as const },
  ];

  return (
    <section className="px-4 pt-28 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento relative overflow-hidden p-8 md:col-span-8 md:p-12"
        >
          <div className="neon-blob-pink -right-10 -top-10 opacity-70" />
          <div className="neon-blob-cyan -bottom-20 -left-10 opacity-40" />
          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-primary">
              <Sparkles className="h-4 w-4" /> Cuentas y UGC con IA
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Contenido <span className="gradient-text">infinito</span> para tus cuentas de TikTok Shop
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Creamos personajes y UGC con IA, lanzamos cuentas desde cero y las escalamos con
              publicación diaria. Sin grabar, sin depender de creadores y con métricas de venta.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full px-8 glow-pink" onClick={goToContact}>
                Quiero mi plan <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-transparent px-8 hover:bg-white/5">
                <a href="#planes">Ver precios</a>
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-solid bento-hover-cyan flex flex-col justify-center gap-8 p-8 md:col-span-4"
        >
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">Coste por vídeo</div>
          <div>
            <div className="font-display text-5xl font-bold tracking-tighter text-secondary md:text-6xl">-90%</div>
            <div className="mt-1 font-medium">frente a un creador tradicional</div>
            <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[90%] bg-secondary" />
            </div>
          </div>
        </motion.div>

        {metrics.map((m, i) => {
          const isPink = m.accent === "primary";
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className={`bento ${isPink ? "bento-hover-pink" : "bento-hover-cyan"} p-6 md:col-span-4`}
            >
              <m.icon className={`h-5 w-5 ${isPink ? "text-primary" : "text-secondary"}`} />
              <p className="mt-4 font-display text-3xl font-bold">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.label}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ContenidoIAHero;
