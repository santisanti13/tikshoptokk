import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Search, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductResearchHero = () => {
  const navigate = useNavigate();

  const goToContact = () => {
    navigate("/");
    setTimeout(() => {
      document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden pt-16">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-primary/25 blur-[150px]" />
      <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[130px]" />
      <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
    </div>

    <div className="container relative z-10 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <Search className="h-4 w-4" />
          Product Research
        </div>

        <h1 className="mx-auto max-w-5xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Detectamos los{" "}
          <span className="bg-gradient-to-r from-primary via-pink-400 to-secondary bg-clip-text text-transparent">
            productos virales
          </span>{" "}
          antes que nadie
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Analizamos millones de datos en TikTok Shop para encontrar los
          productos con mayor potencial de ventas. Nuestro sistema de
          investigación identifica tendencias antes de que exploten.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2 text-base" onClick={goToContact}>
              Solicitar investigación
              <ArrowRight className="h-4 w-4" />
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <a href="#viral-products">Ver productos trending</a>
          </Button>
        </div>
      </motion.div>

      {/* Floating metric cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          {
            icon: TrendingUp,
            value: "50K+",
            label: "Productos analizados diariamente",
            gradient: "from-primary/20 to-pink-500/20",
          },
          {
            icon: BarChart3,
            value: "95%",
            label: "Precisión en predicción de tendencias",
            gradient: "from-secondary/20 to-cyan-400/20",
          },
          {
            icon: Search,
            value: "12+",
            label: "Categorías monitorizadas",
            gradient: "from-primary/20 to-secondary/20",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${stat.gradient} p-6 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5`}
          >
            <stat.icon className="mb-3 h-8 w-8 text-primary" />
            <p className="font-display text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default ProductResearchHero;
