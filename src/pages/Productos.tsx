import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductosGrid from "@/components/productos/ProductosGrid";
import ProductResearchCTA from "@/components/product-research/ProductResearchCTA";

const Productos = () => (
  <>
    <SEO
      title="Productos virales del top 5 de TikTok Shop España"
      description="Los productos más vendidos del top 5 de tiendas de TikTok Shop España, con vídeo UGC de cada uno y enlace directo para comprar en la tienda del creador."
      path="/productos"
    />
    <Navbar />
    <ProductosGrid />
    <ProductResearchCTA />
    <Footer />
  </>
);

export default Productos;
