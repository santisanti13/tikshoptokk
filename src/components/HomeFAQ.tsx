import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LOCALIDADES } from "@/data/localidades";
import { GUIAS } from "@/data/guias";

const FAQS = [
  { q: "¿Qué hace una agencia de TikTok Shop?", a: "Da de alta y opera tu tienda en TikTok Shop, prepara el catálogo, crea contenido que vende, conecta tu marca con creadores afiliados y busca productos con potencial viral." },
  { q: "¿Trabajáis con marcas de toda España?", a: "Sí. El equipo tiene base en Valencia y trabaja con marcas de Madrid, Barcelona, Sevilla y el resto de España." },
  { q: "¿Necesito tener ya cuenta en TikTok Shop?", a: "No. Podemos encargarnos del alta en Seller Center y de dejar la tienda lista para vender." },
  { q: "¿Puedo crear yo el contenido con IA?", a: "Sí. Con el estudio de contenido IA de TikShopTok puedes generar vídeos UGC enfocados a TikTok Shop por tu cuenta." },
];

const HomeFAQ = () => (
  <section id="faq" className="px-4 py-20 md:px-8">
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        })}
      </script>
    </Helmet>
    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="font-display text-3xl font-bold md:text-4xl">Preguntas sobre nuestra agencia de TikTok Shop</h2>
        <dl className="mt-8 space-y-6">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="bento space-y-6 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Guías</p>
          <ul className="mt-3 space-y-2 text-sm">
            {GUIAS.map((g) => (
              <li key={g.slug}><Link to={`/guias/${g.slug}`} className="hover:text-primary">{g.h1}</Link></li>
            ))}
            <li><Link to="/ranking-tiktok-shop-espana" className="hover:text-primary">Ranking TikTok Shop España (diario)</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Agencia por ciudad</p>
          <ul className="mt-3 space-y-2 text-sm">
            {LOCALIDADES.map((l) => (
              <li key={l.slug}><Link to={`/agencia-tiktok-shop/${l.slug}`} className="hover:text-primary">Agencia TikTok Shop en {l.ciudad}</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default HomeFAQ;
