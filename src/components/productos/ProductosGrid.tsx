import { motion } from "framer-motion";
import { ArrowUpRight, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import mikomika from "@/assets/ugc/mikomika-maleta.mp4.asset.json";
import aldous from "@/assets/ugc/aldous-bio-suplemento.mp4.asset.json";
import utopya from "@/assets/ugc/utopya-moda.mp4.asset.json";
import armonias from "@/assets/ugc/armonias-vestido.mp4.asset.json";
import ninja from "@/assets/ugc/ninja-kitchen-freidora.mp4.asset.json";

type Item = {
  rank: string;
  store: string;
  product: string;
  category: string;
  description: string;
  video: string;
};

const storeUrl = (store: string) =>
  `https://www.tiktok.com/search?q=${encodeURIComponent(store)}`;

const items: Item[] = [
  {
    rank: "01",
    store: "MIKOMIKA",
    product: "Maleta de cabina",
    category: "Viaje y maletas",
    description:
      "Maleta rígida de cabina, el producto que lidera el ranking de GMV de la tienda.",
    video: mikomika.url,
  },
  {
    rank: "02",
    store: "Aldous Bio",
    product: "Suplemento en cápsulas",
    category: "Salud y bienestar",
    description:
      "Bote de suplemento natural, su referencia con más pedidos recurrentes.",
    video: aldous.url,
  },
  {
    rank: "03",
    store: "UTOPYA",
    product: "Conjunto de punto",
    category: "Moda",
    description: "Conjunto de punto de temporada, su pieza más viral en vídeo.",
    video: utopya.url,
  },
  {
    rank: "04",
    store: "Armonías",
    product: "Vestido midi",
    category: "Moda",
    description: "Vestido midi que funciona especialmente bien en formato unboxing.",
    video: armonias.url,
  },
  {
    rank: "05",
    store: "Ninja Kitchen ES",
    product: "Freidora de aire",
    category: "Electrodomésticos",
    description:
      "Freidora de aire, el clásico de cocina con mayor conversión en directo.",
    video: ninja.url,
  },
];

const ProductosGrid = () => (
  <section className="px-4 pb-20 pt-28 md:px-8">
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento relative overflow-hidden p-8 md:p-12"
      >
        <div className="neon-blob-pink -right-10 -top-10 opacity-70" />
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-primary">
            <ShoppingBag className="h-4 w-4" /> Catálogo top 5
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Los productos que <span className="gradient-text">más venden</span> en TikTok Shop España
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Selección de las cinco tiendas líderes por GMV en nuestro último pulso de TikTok Shop
            España. Cada ficha incluye un vídeo UGC creado con IA por nosotros y el enlace para
            comprar en la tienda del creador.
          </p>
        </div>
      </motion.div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <motion.article
            key={item.store}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bento-solid bento-hover-cyan flex flex-col overflow-hidden p-5"
          >
            <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video
                src={item.video}
                className="aspect-[9/16] w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
              <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-secondary backdrop-blur">
                #{item.rank}
              </span>
            </div>

            <div className="mt-5 flex flex-1 flex-col">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {item.category}
              </div>
              <h2 className="mt-2 font-display text-xl font-bold tracking-tight">{item.product}</h2>
              <div className="mt-1 text-sm text-secondary">{item.store}</div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{item.description}</p>

              <Button asChild className="mt-5 w-full rounded-full">
                <a href={storeUrl(item.store)} target="_blank" rel="noopener noreferrer">
                  Comprar en la tienda <ArrowUpRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
              <p className="mt-3 inline-flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                Vídeo de muestra creado con IA por TikShopTok. La compra se completa en TikTok Shop,
                en el perfil del creador.
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default ProductosGrid;
