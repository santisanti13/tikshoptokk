import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, MapPin } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { LOCALIDADES, getLocalidad } from "@/data/localidades";
import NotFound from "@/pages/NotFound";

const SITE = "https://tikshoptok.com";

const AgenciaLocal = () => {
  const { ciudad: slug } = useParams();
  const loc = getLocalidad(slug);

  if (!loc) return <NotFound />;

  const path = `/agencia-tiktok-shop/${loc.slug}`;
  const esBase = loc.slug === "valencia";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: `TikShopTok — Agencia de TikTok Shop en ${loc.ciudad}`,
      description: loc.description,
      url: `${SITE}${path}`,
      areaServed: { "@type": "City", name: loc.ciudad },
      address: { "@type": "PostalAddress", addressLocality: "Valencia", addressRegion: "Valencia", addressCountry: "ES" },
      knowsLanguage: "es",
      priceRange: "690€ - 4500€",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: `Agencia TikTok Shop en ${loc.ciudad}`, item: `${SITE}${path}` },
      ],
    },
  ];

  return (
    <>
      <SEO title={loc.title} description={loc.description} path={path} jsonLd={jsonLd} />
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-32 md:px-8">
        <nav aria-label="Ruta de navegación" className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Inicio</Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{loc.ciudad}</span>
        </nav>

        <header className="max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {esBase ? "Base del equipo" : `Marcas de ${loc.provincia}`}
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.05] md:text-6xl">{loc.h1}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{loc.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="/#contacto">
                Hablar de mi marca <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contenido-ia">Quiero hacerlo yo con IA</Link>
            </Button>
          </div>
        </header>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {loc.contexto.map((texto) => (
            <p key={texto} className="rounded-2xl border border-white/[0.07] bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground">
              {texto}
            </p>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Cómo trabajamos con una marca de {loc.ciudad}
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {loc.comoTrabajamos.map((paso, i) => (
              <li key={paso.titulo} className="rounded-2xl border border-white/[0.07] bg-card/60 p-6">
                <span className="font-display text-xs text-primary">0{i + 1}</span>
                <h3 className="mt-2 font-display text-lg font-semibold">{paso.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 rounded-3xl border border-white/[0.07] bg-card/60 p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold">Categorías en las que ponemos el foco</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {loc.foco.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 shrink-0 text-secondary" /> {f}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Más de 100.000 productos vendidos, 1,2 M € facturados por creadores de nuestra red y más de 150 productos
            lanzados en TikTok Shop. Los planes de agencia van de 690 € a 4.500 € al mes, con un lanzamiento puntual de
            1.200 € para marcas que empiezan de cero.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">Preguntas frecuentes</h2>
          <dl className="mt-6 space-y-5">
            {loc.faqs.map((faq) => (
              <div key={faq.q} className="border-b border-white/[0.06] pb-5">
                <dt className="font-semibold">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-lg font-semibold">Otras ciudades</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {LOCALIDADES.filter((l) => l.slug !== loc.slug).map((l) => (
              <li key={l.slug}>
                <Link
                  to={`/agencia-tiktok-shop/${l.slug}`}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  Agencia TikTok Shop en {l.ciudad}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AgenciaLocal;
