import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import VideoShowcase from "@/components/VideoShowcase";
import Process from "@/components/Process";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => (
  <>
    <SEO
      title="TikShopTok — Agencia de TikTok Shop y Social Commerce"
      description="Agencia nativa de TikTok Shop: product research, creación de marcas, gestión de creadores UGC y lanzamiento de productos virales a escala."
      path="/"
    />
    <Navbar />
    <Hero />
    <Services />
    <VideoShowcase />
    <Process />
    <WhyUs />
    <Testimonials />
    <Contact />
    <Footer />
  </>
);

export default Index;
