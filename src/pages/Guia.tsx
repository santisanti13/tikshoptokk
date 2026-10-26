import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { GUIAS, getGuia } from "@/data/guias";
import NotFound from "@/pages/NotFound";

const SITE = "https://tikshoptok.com";

const Guia = () => {
  const { slug } = useParams();
  const g = getGuia(slug);
  if (!g) return <NotFound />;
  const path = `/guias/${g.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: g.title,
      description: g.description,
      url: `${SITE}${path}`,
      inLanguage: "es-ES",
      author: { "@type": "Organization", name: "TikShopTok", url: SITE },
      publisher: { "@type": "Organization", name: "TikShopTok", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: g.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: g.h1, item: `${SITE}${path}` },
      ],
    },
  ];

  return (
    <>
      <SEO title={`${g.title} | TikShopTok`} description={g.description} path={path} type="article" jsonLd={jsonLd} />
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-32 md:px-8">
        <nav aria-label="Ruta de navegación" className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Inicio</Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Guías</span>
        </nav>
        <h1 className="font-display text-4xl font-bold leading-[1.05] md:text-5xl">{g.h1}</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{g.intro}</p>

        {g.secciones.map((s) => (
          <section key={s.h2} className="mt-10">
            <h2 className="font-display text-2xl font-bold">{s.h2}</h2>
            {s.parrafos.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-muted-foreground">{p}</p>
            ))}
            {s.lista && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                {s.lista.map((i) => <li key={i}>{i}</li>)}
              </ul>
            )}
          </section>
        ))}

        <p className="mt-8 text-sm text-muted-foreground">
          Mira qué está vendiendo hoy: <Link to="/ranking-tiktok-shop-espana" className="text-primary hover:underline">Ranking TikTok Shop España</Link>.
        </p>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">Preguntas frecuentes</h2>
          <dl className="mt-4 space-y-5">
            {g.faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1 text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="bento mt-12 p-6">
          <h2 className="font-display text-xl font-bold">¿Prefieres que lo hagamos por ti?</h2>
          <p className="mt-2 text-muted-foreground">Somos una agencia de TikTok Shop: alta, catálogo, creadores y contenido.</p>
          <Button asChild className="mt-4"><a href="/#contacto">Hablar con la agencia <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
        </section>

        <nav aria-label="Más guías" className="mt-12">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Más guías</p>
          <ul className="mt-3 space-y-2">
            {GUIAS.filter((x) => x.slug !== g.slug).map((x) => (
              <li key={x.slug}><Link to={`/guias/${x.slug}`} className="hover:text-primary">{x.h1}</Link></li>
            ))}
          </ul>
        </nav>
      </main>
      <Footer />
    </>
  );
};

export default Guia;
