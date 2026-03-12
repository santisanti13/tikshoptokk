import { motion } from "framer-motion";

const tiktokVideos = [
  "7597044434647174422",
  "7594408068671130902",
  "7580033109358382358",
  "7568535529944370454",
  "7552960543808687392",
];

const VideoShowcase = () => (
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
          Así se ven los productos, marcas y creadores que gestionamos en TikTok
          Shop. Resultados reales, ventas reales.
        </p>
      </motion.div>

      <div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto pb-4 sm:gap-6 sm:justify-center sm:flex-wrap sm:overflow-x-visible">
        {tiktokVideos.map((id, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex-shrink-0"
          >
            <iframe
              src={`https://www.tiktok.com/embed/v2/${id}`}
              className="h-[580px] w-[325px] rounded-xl border border-border"
              allowFullScreen
              allow="encrypted-media"
              loading="lazy"
              title={`TikTok video ${i + 1}`}
            />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default VideoShowcase;
