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
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <section id="videos" className="px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="bento relative overflow-hidden p-6 md:p-10">
          <div className="neon-blob-pink -right-20 -top-20 opacity-40" />
          <div className="neon-blob-cyan -bottom-20 -left-20 opacity-40" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">Showcase</p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Resultados <span className="gradient-text">en acción</span>
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Hemos lanzado cientos de productos en TikTok Shop con +500K visualizaciones en 3 meses.
                Gestión integral de contenido y creadores en más de 20 categorías.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-white/15 bg-white/5 backdrop-blur hover:bg-white/10"
                onClick={() => scroll("left")}
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-white/15 bg-white/5 backdrop-blur hover:bg-white/10"
                onClick={() => scroll("right")}
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          <div
            ref={scrollRef}
            className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          >
            {tiktokVideos.map((id, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.5) }}
                className="flex-none snap-center overflow-hidden rounded-3xl border border-white/10 bg-black"
                style={{ width: 280, height: 500 }}
              >
                <iframe
                  src={`https://www.tiktok.com/player/v1/${id}?autoplay=1&loop=1&mute=1&controls=0`}
                  className="h-full w-full"
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
