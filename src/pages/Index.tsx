import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandsMarquee from "@/components/BrandsMarquee";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import VideoShowcase from "@/components/VideoShowcase";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import SaasBridge from "@/components/SaasBridge";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => (
  <>
    <SEO
      title="TikShopTok — Agencia de TikTok Shop y Social Commerce"
      description="Agencia nativa de TikTok Shop: creación de cuentas de contenido y de venta, gestión de tiendas y feed, red de creadores afiliados y product research."
      path="/"
    />
    <Navbar />
    <Hero />
    <BrandsMarquee />
    <Services />
    <WhyUs />
    <VideoShowcase />
    <Process />
    <Testimonials />
    <SaasBridge />
    <Contact />
    <Footer />
  </>
);

export default Index;
