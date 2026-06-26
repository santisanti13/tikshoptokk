import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductResearchCTA = () => {
  const navigate = useNavigate();
  const goToContact = () => {
    navigate("/");
    setTimeout(() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" }), 300);
  };

  return (
    <section className="px-4 py-24 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bento relative mx-auto max-w-7xl overflow-hidden p-10 md:p-16"
      >
        <div className="neon-blob-pink -right-20 -top-20 opacity-70" />
        <div className="neon-blob-cyan -bottom-20 -left-20 opacity-60" />
        <div className="relative text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <Rocket className="h-4 w-4" /> Empieza hoy
          </div>
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
            ¿Listo para tu <span className="gradient-text">próximo producto ganador</span>?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Te entregamos un informe personalizado con los productos de mayor potencial en TikTok Shop.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full px-8 glow-pink" onClick={goToContact}>
              Solicitar investigación <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-transparent px-8 hover:bg-white/5">
              <a href="/">Volver al inicio</a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ProductResearchCTA;
