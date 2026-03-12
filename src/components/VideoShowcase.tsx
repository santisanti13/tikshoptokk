import { motion } from "framer-motion";
import { Play } from "lucide-react";

const videos = [
  {
    title: "Producto viral: +500K ventas",
    description: "Estrategia de lanzamiento en TikTok Shop",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=700&fit=crop",
  },
  {
    title: "Marca de skincare: caso de éxito",
    description: "De 0 a 10K pedidos en 30 días",
    thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=700&fit=crop",
  },
  {
    title: "Creador conectado con marca",
    description: "Contenido que generó +2M de views",
    thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=700&fit=crop",
  },
  {
    title: "Adaptación de producto viral",
    description: "De Amazon a TikTok Shop en 7 días",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=700&fit=crop",
  },
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

      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {videos.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative aspect-[9/16] overflow-hidden rounded-xl border border-border"
          >
            <img
              src={v.thumbnail}
              alt={v.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/30 to-transparent p-4">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/80 p-3 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
              </div>
              <p className="text-sm font-semibold leading-tight text-foreground">
                {v.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {v.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default VideoShowcase;
