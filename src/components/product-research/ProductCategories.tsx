import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, Home, Shirt, Dumbbell, Baby, Utensils, Smartphone, Palette, Gem, Dog, Leaf } from "lucide-react";
import WaitlistDialog from "./WaitlistDialog";

const categories = [
  { icon: Heart, name: "Beauty & Skincare", products: "8.2K+", growth: "+142%" },
  { icon: Home, name: "Home & Living", products: "5.1K+", growth: "+89%" },
  { icon: Shirt, name: "Fashion", products: "12.4K+", growth: "+67%" },
  { icon: Dumbbell, name: "Fitness & Health", products: "3.8K+", growth: "+198%" },
  { icon: Baby, name: "Baby & Kids", products: "2.9K+", growth: "+124%" },
  { icon: Utensils, name: "Kitchen & Food", products: "4.5K+", growth: "+156%" },
  { icon: Smartphone, name: "Tech & Gadgets", products: "6.7K+", growth: "+93%" },
  { icon: Palette, name: "Arts & Crafts", products: "1.8K+", growth: "+211%" },
  { icon: Gem, name: "Jewelry", products: "7.3K+", growth: "+78%" },
  { icon: Dog, name: "Pets", products: "2.1K+", growth: "+187%" },
  { icon: Leaf, name: "Wellness", products: "3.4K+", growth: "+165%" },
  { icon: Sparkles, name: "Viral & Trending", products: "15K+", growth: "+320%" },
];

const ProductCategories = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();

  const openWaitlist = (name: string) => {
    setSelected(name);
    setWaitlistOpen(true);
  };

  return (
    <section className="px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">Categorías</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
            Las categorías más <span className="gradient-text">rentables</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((cat, i) => (
            <motion.button
              type="button"
              onClick={() => openWaitlist(cat.name)}
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="bento bento-hover-pink p-5 text-left cursor-pointer"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/15">
                <cat.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="font-display text-sm font-semibold leading-tight">{cat.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{cat.products}</p>
              <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                {cat.growth}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} itemName={selected} />
    </section>
  );
};

export default ProductCategories;
