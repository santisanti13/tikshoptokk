import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContenidoIAHero from "@/components/contenido-ia/ContenidoIAHero";
import ContenidoIAPlans from "@/components/contenido-ia/ContenidoIAPlans";
import ProductResearchCTA from "@/components/product-research/ProductResearchCTA";

const ContenidoIA = () => (
  <>
    <SEO
      title="Cuentas sintéticas y UGC con IA — TikShopTok"
      description="Creamos, lanzamos y escalamos cuentas de TikTok Shop con contenido IA: UGC diario para ecommerce, avatares de marca y planes desde 690 €/mes."
      path="/contenido-ia"
    />
    <Navbar />
    <ContenidoIAHero />
    <ContenidoIAPlans />
    <ProductResearchCTA />
    <Footer />
  </>
);

export default ContenidoIA;
