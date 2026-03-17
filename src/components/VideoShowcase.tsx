import { motion } from "framer-motion";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiktokVideos = [
  "7597044434647174422",
  "7594408068671130902",
  "7580033109358382358",
  "7568535529944370454",
  "7552960543808687392",
  "7603703003782090006",
  "7585540094824598806",
  "7569572860449082646",
  "7562146211747122465",
  "7610820653284936982",
  "7608914775384362262",
  "7606346631482477846",
  "7595571355811122454",
  "7567053674040593686",
  "7589295993913412886",
  "7563252871504891158",
];

const VideoShowcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 260;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="videos" className="bg-card py-20 lg:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Resultados{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              en acción
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Hemos lanzado cientos de productos a TikTok Shop con +500K
            visualizaciones en 3 meses. Gestión integral de contenido y
            creadores en más de 20 categorías distintas. Resultados reales,
            ventas reales.
          </p>
        </motion.div>

        <div className="relative">
          {/* Flechas */}
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border-border bg-card/80 backdrop-blur-sm md:flex"
            onClick={() => scroll("left")}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border-border bg-card/80 backdrop-blur-sm md:flex"
            onClick={() => scroll("right")}
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Carrusel */}
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-2 pb-4 scrollbar-hide sm:gap-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {tiktokVideos.map((id, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-none snap-center"
                style={{ width: 280, height: 500 }}
              >
                <iframe
                  src={`https://www.tiktok.com/player/v1/${id}?autoplay=1&loop=1&mute=1&controls=0`}
                  className="h-full w-full rounded-xl border border-border"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                  loading="lazy"
                  title={`TikTok video ${i + 1}`}
                  style={{ border: "none" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;
