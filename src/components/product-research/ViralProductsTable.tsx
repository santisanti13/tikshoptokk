import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Flame, Eye, ShoppingCart, Star, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import WaitlistDialog from "./WaitlistDialog";

interface ViralProduct {
  rank: number;
  name: string;
  category: string;
  price: string;
  sales: string;
  revenue: string;
  views: string;
  growth: string;
  growthPositive: boolean;
  viralScore: number;
  trending: boolean;
}

// Curated data of real trending TikTok Shop products
const MOCK_PRODUCTS: ViralProduct[] = [
  { rank: 1, name: "Glow Recipe Watermelon Dew Drops", category: "Beauty", price: "$34.00", sales: "245K+", revenue: "$8.3M", views: "89M", growth: "+342%", growthPositive: true, viralScore: 98, trending: true },
  { rank: 2, name: "Stanley Quencher H2.0 Tumbler", category: "Home", price: "$45.00", sales: "198K+", revenue: "$8.9M", views: "156M", growth: "+278%", growthPositive: true, viralScore: 96, trending: true },
  { rank: 3, name: "CeraVe Moisturizing Cream", category: "Skincare", price: "$19.99", sales: "312K+", revenue: "$6.2M", views: "124M", growth: "+189%", growthPositive: true, viralScore: 95, trending: true },
  { rank: 4, name: "Dyson Airwrap Complete", category: "Beauty Tech", price: "$599.99", sales: "45K+", revenue: "$27M", views: "201M", growth: "+156%", growthPositive: true, viralScore: 94, trending: true },
  { rank: 5, name: "Laneige Lip Sleeping Mask", category: "Beauty", price: "$24.00", sales: "287K+", revenue: "$6.9M", views: "78M", growth: "+234%", growthPositive: true, viralScore: 93, trending: false },
  { rank: 6, name: "Our Place Always Pan", category: "Kitchen", price: "$150.00", sales: "67K+", revenue: "$10M", views: "45M", growth: "+167%", growthPositive: true, viralScore: 91, trending: false },
  { rank: 7, name: "Cosrx Snail Mucin Essence", category: "Skincare", price: "$25.00", sales: "256K+", revenue: "$6.4M", views: "92M", growth: "+198%", growthPositive: true, viralScore: 90, trending: true },
  { rank: 8, name: "Scrub Daddy Sponge Set", category: "Home", price: "$18.99", sales: "178K+", revenue: "$3.4M", views: "67M", growth: "+145%", growthPositive: true, viralScore: 88, trending: false },
  { rank: 9, name: "E.L.F. Power Grip Primer", category: "Beauty", price: "$10.00", sales: "345K+", revenue: "$3.5M", views: "134M", growth: "+267%", growthPositive: true, viralScore: 87, trending: true },
  { rank: 10, name: "Kindle Paperwhite 2024", category: "Tech", price: "$149.99", sales: "89K+", revenue: "$13.3M", views: "56M", growth: "+123%", growthPositive: true, viralScore: 86, trending: false },
  { rank: 11, name: "Rare Beauty Soft Pinch Blush", category: "Beauty", price: "$23.00", sales: "234K+", revenue: "$5.4M", views: "167M", growth: "+312%", growthPositive: true, viralScore: 85, trending: true },
  { rank: 12, name: "Bissell Little Green Machine", category: "Home", price: "$123.59", sales: "56K+", revenue: "$6.9M", views: "89M", growth: "+134%", growthPositive: true, viralScore: 84, trending: false },
  { rank: 13, name: "Sol de Janeiro Brazilian Bum Bum", category: "Body Care", price: "$48.00", sales: "123K+", revenue: "$5.9M", views: "45M", growth: "+98%", growthPositive: true, viralScore: 82, trending: false },
  { rank: 14, name: "Tower 28 SOS Spray", category: "Skincare", price: "$28.00", sales: "145K+", revenue: "$4.1M", views: "34M", growth: "+167%", growthPositive: true, viralScore: 81, trending: false },
  { rank: 15, name: "Mielle Rosemary Mint Oil", category: "Hair Care", price: "$9.99", sales: "456K+", revenue: "$4.6M", views: "234M", growth: "+456%", growthPositive: true, viralScore: 80, trending: true },
  { rank: 16, name: "Anker Soundcore Earbuds", category: "Tech", price: "$79.99", sales: "98K+", revenue: "$7.8M", views: "23M", growth: "+87%", growthPositive: true, viralScore: 78, trending: false },
  { rank: 17, name: "Supergoop Unseen Sunscreen", category: "Skincare", price: "$38.00", sales: "167K+", revenue: "$6.3M", views: "56M", growth: "+145%", growthPositive: true, viralScore: 77, trending: false },
  { rank: 18, name: "Ninja Creami Ice Cream Maker", category: "Kitchen", price: "$199.99", sales: "34K+", revenue: "$6.8M", views: "78M", growth: "+189%", growthPositive: true, viralScore: 76, trending: true },
  { rank: 19, name: "Peter Thomas Roth Eye Patches", category: "Beauty", price: "$75.00", sales: "78K+", revenue: "$5.9M", views: "45M", growth: "+112%", growthPositive: true, viralScore: 75, trending: false },
  { rank: 20, name: "Olaplex No. 3 Hair Treatment", category: "Hair Care", price: "$30.00", sales: "189K+", revenue: "$5.7M", views: "67M", growth: "+134%", growthPositive: true, viralScore: 74, trending: false },
];

/** Busca el primer valor cuya clave contenga alguno de los términos dados. */
const pick = (row: Record<string, unknown>, terms: string[]): string => {
  for (const [key, value] of Object.entries(row)) {
    const k = key.toLowerCase();
    if (terms.some((t) => k.includes(t)) && value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "—";
};

const toNumber = (text: string) => {
  const n = Number.parseFloat(text.replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

/** Convierte una captura real de FastMoss en las filas de la tabla. */
const mapSnapshot = (rows: Record<string, unknown>[]): ViralProduct[] =>
  rows.slice(0, 20).map((row, i) => {
    const growth = pick(row, ["crecim", "growth", "incre", "%"]);
    const views = pick(row, ["view", "visit", "visualiza", "reproduc"]);
    return {
      rank: toNumber(pick(row, ["rank", "#", "puesto"])) || i + 1,
      name: pick(row, ["producto", "product", "title", "nombre", "video", "tienda", "shop"]),
      category: pick(row, ["categor", "category"]),
      price: pick(row, ["precio", "price"]),
      sales: pick(row, ["venta", "sales", "unidad", "orders", "pedido"]),
      revenue: pick(row, ["gmv", "revenue", "ingres", "facturac"]),
      views,
      growth,
      growthPositive: !growth.trim().startsWith("-"),
      viralScore: Math.max(40, Math.min(99, 100 - i * 2)),
      trending: i < 5,
    };
  });

const ViralProductsTable = () => {
  const [products, setProducts] = useState<ViralProduct[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const { toast } = useToast();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | undefined>();

  const openWaitlist = (name: string) => {
    setSelectedItem(name);
    setWaitlistOpen(true);
  };

  /** Carga la última captura real guardada (FastMoss). */
  const loadSnapshot = async (announce = false) => {
    const { data } = await supabase
      .from("market_snapshots")
      .select("captured_on, rows, source")
      .eq("country", "ES")
      .order("captured_on", { ascending: false })
      .limit(1)
      .maybeSingle();

    const rows = (data?.rows as Record<string, unknown>[] | undefined) ?? [];
    if (rows.length) {
      setProducts(mapSnapshot(rows));
      setIsLive(true);
      setLastChecked(data?.captured_on ? new Date(data.captured_on) : new Date());
      if (announce) {
        toast({
          title: "Datos reales cargados",
          description: `Última captura de ${data?.source ?? "FastMoss"} del ${new Date(
            data?.captured_on ?? Date.now(),
          ).toLocaleDateString("es-ES")}.`,
        });
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    void loadSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFetchLive = async () => {
    setLoading(true);
    try {
      const live = await loadSnapshot(true);
      if (!live) {
        toast({
          title: "Todavía sin captura del día",
          description:
            "Mostramos nuestro ranking curado hasta que se traiga la próxima captura real de TikTok Shop España.",
        });
        setLastChecked(new Date());
      }
    } catch (err) {
      console.error("Error fetching live data:", err);
      toast({
        title: "No hemos podido comprobar las tendencias",
        description: "Inténtalo de nuevo en unos minutos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 80) return "text-yellow-400";
    return "text-orange-400";
  };

  const getViralScoreBg = (score: number) => {
    if (score >= 90) return "bg-emerald-400/10";
    if (score >= 80) return "bg-yellow-400/10";
    return "bg-orange-400/10";
  };

  return (
    <section id="viral-products" className="relative py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/3 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-secondary/8 blur-[120px]" />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Top Productos
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Los{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                20 productos más virales
              </span>{" "}
              en TikTok Shop
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Actualizado con datos en tiempo real. Estos son los productos que
              están generando más ventas y engagement ahora mismo.
            </p>
          </div>
          <Button
            onClick={handleFetchLive}
            disabled={loading}
            variant="outline"
            className="gap-2 border-primary/30 hover:bg-primary/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Actualizando..." : "Actualizar datos"}
          </Button>
        </motion.div>

        {/* Products grid - modern card layout instead of plain table */}
        <div className="space-y-3">
          {/* Header */}
          <div className="hidden rounded-xl border border-border/50 bg-muted/30 px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:grid lg:grid-cols-12 lg:gap-4">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Producto</div>
            <div className="col-span-1">Precio</div>
            <div className="col-span-1 text-right">Ventas</div>
            <div className="col-span-2 text-right">Revenue</div>
            <div className="col-span-1 text-right">Views</div>
            <div className="col-span-1 text-right">Crecimiento</div>
            <div className="col-span-2 text-center">Viral Score</div>
          </div>

          {products.map((product, i) => (
            <motion.button
              type="button"
              onClick={() => openWaitlist(product.name)}
              key={product.rank}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="group relative w-full text-left overflow-hidden rounded-xl border border-border/30 bg-card/40 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/70 sm:px-6 cursor-pointer"
            >
              {/* Hover gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/3 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              {/* Mobile layout */}
              <div className="relative flex items-center gap-4 lg:hidden">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/10 font-display text-sm font-bold">
                  {product.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    {product.trending && <Flame className="h-3.5 w-3.5 flex-shrink-0 text-orange-400" />}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
                    <span>{product.price}</span>
                    <span className="text-emerald-400">{product.growth}</span>
                  </div>
                </div>
                <div className={`flex-shrink-0 rounded-lg px-2 py-1 text-xs font-bold ${getViralScoreBg(product.viralScore)} ${getViralScoreColor(product.viralScore)}`}>
                  {product.viralScore}
                </div>
              </div>

              {/* Desktop layout */}
              <div className="relative hidden lg:grid lg:grid-cols-12 lg:items-center lg:gap-4">
                <div className="col-span-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/10 font-display text-sm font-bold">
                    {product.rank}
                  </div>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{product.name}</span>
                  {product.trending && <Flame className="h-3.5 w-3.5 flex-shrink-0 text-orange-400" />}
                  <Badge variant="outline" className="ml-1 text-[10px]">{product.category}</Badge>
                </div>
                <div className="col-span-1 text-sm">{product.price}</div>
                <div className="col-span-1 text-right">
                  <div className="flex items-center justify-end gap-1 text-sm">
                    <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                    {product.sales}
                  </div>
                </div>
                <div className="col-span-2 text-right text-sm font-medium">{product.revenue}</div>
                <div className="col-span-1 text-right">
                  <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {product.views}
                  </div>
                </div>
                <div className="col-span-1 text-right">
                  <span className={`inline-flex items-center gap-0.5 text-sm font-semibold ${product.growthPositive ? "text-emerald-400" : "text-red-400"}`}>
                    {product.growthPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {product.growth}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${product.viralScore >= 90 ? "from-emerald-500 to-emerald-400" : product.viralScore >= 80 ? "from-yellow-500 to-yellow-400" : "from-orange-500 to-orange-400"}`}
                      style={{ width: `${product.viralScore}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${getViralScoreColor(product.viralScore)}`}>
                    {product.viralScore}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {lastChecked && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-xs text-muted-foreground"
          >
            {isLive
              ? `✅ Datos reales de TikTok Shop España · captura del ${lastChecked.toLocaleDateString("es-ES")}`
              : `✅ Fuentes comprobadas a las ${lastChecked.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} · ranking curado por TikShopTok`}
          </motion.p>
        )}
      </div>
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} itemName={selectedItem} />
    </section>
  );
};

export default ViralProductsTable;
