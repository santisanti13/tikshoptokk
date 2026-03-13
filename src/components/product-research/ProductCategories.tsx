import { motion } from "framer-motion";
import { Sparkles, Heart, Home, Shirt, Dumbbell, Baby, Utensils, Smartphone, Palette, Gem, Dog, Leaf } from "lucide-react";

const categories = [
  { icon: Heart, name: "Beauty & Skincare", products: "8.2K+", growth: "+142%" },
  { icon: Home, name: "Home & Living", products: "5.1K+", growth: "+89%" },
  { icon: Shirt, name: "Fashion", products: "12.4K+", growth: "+67%" },
  { icon: Dumbbell, name: "Fitness & Health", products: "3.8K+", growth: "+198%" },
  { icon: Baby, name: "Baby & Kids", products: "2.9K+", growth: "+124%" },
  { icon: Utensils, name: "Kitchen & Food", products: "4.5K+", growth: "+156%" },
  { icon: Smartphone, name: "Tech & Gadgets", products: "6.7K+", growth: "+93%" },
  { icon: Palette, name: "Arts & Crafts", products: "1.8K+", growth: "+211%" },
  { icon: Gem, name: "Jewelry & Accessories", products: "7.3K+", growth: "+78%" },
  { icon: Dog, name: "Pets", products: "2.1K+", growth: "+187%" },
  { icon: Leaf, name: "Wellness & Self-Care", products: "3.4K+", growth: "+165%" },
  { icon: Sparkles, name: "Viral & Trending", products: "15K+", growth: "+320%" },
];

const ProductCategories = () => (
  <section className="relative py-24">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/3 top-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px]" />
    </div>

    <div className="container relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Categorías
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Monitorizamos las categorías más{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            rentables
          </span>
        </h2>
      </motion.div>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/30 p-4 text-center backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card/60"
          >
            <div className="mx-auto mb-2 inline-flex rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 p-2.5">
              <cat.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium leading-tight">{cat.name}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">{cat.products} productos</p>
            <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              {cat.growth}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProductCategories;
