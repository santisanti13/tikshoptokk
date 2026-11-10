import { Link } from "react-router-dom";
import { ArrowRight, Check, MapPin, Store, Users, Rocket, CalendarClock } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TikTokGoWaitlist from "@/components/TikTokGoWaitlist";
import { Button } from "@/components/ui/button";

const SITE = "https://tikshoptok.com";
const PATH = "/tiktok-go";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "TikShopTok — Agencia TikTok Go España",
    description:
      "Servicio de preparación y lanzamiento para TikTok Go en España: posicionamiento de negocios locales, red de creadores locales y campañas de descubrimiento local.",
    url: `${SITE}${PATH}`,
    provider: {
      "@type": "ProfessionalService",
      name: "TikShopTok",
      url: SITE,
      address: { "@type": "PostalAddress", addressLocality: "Valencia", addressCountry: "ES" },
    },
    areaServed: { "@type": "Country", name: "España" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "TikTok Go España", item: `${SITE}${PATH}` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué es TikTok Go?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TikTok Go es el programa de comercio local de TikTok: permite a negocios locales (restaurantes, hoteles, experiencias, ocio) aparecer en la plataforma y a creadores promocionarlos a comisión. Ya opera en mercados como Estados Unidos y su llegada a España es cuestión de tiempo.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuándo llega TikTok Go a España?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TikTok no ha anunciado fecha oficial para España. Por eso trabajamos en modo preparación: dejar el negocio, el contenido y la red de creadores listos para el día del lanzamiento.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué puedo hacer ahora si tengo un negocio local?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Preparar tu presencia en TikTok, generar contenido local con creadores de tu ciudad y construir la base de clientes que luego convertirás con TikTok Go. Los que lleguen preparados tendrán ventaja el primer mes.",
        },
      },
      {
        "@type": "Question",
        name: "Soy creador, ¿me interesa TikTok Go?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. TikTok Go abre una vía de ingresos por comisión promocionando negocios de tu zona, sin necesidad de audiencias gigantes: el contenido local hipersegmentado es precisamente lo que el programa premia.",
        },
      },
    ],
  },
];

const paraQuien = [
  {
    icon: Store,
    titulo: "Negocios locales",
    texto:
      "Restaurantes, hoteles, experiencias, gimnasios, ocio. Preparamos tu ficha, tu contenido y tu oferta para que el día que TikTok Go abra en España salgas vendiendo desde la primera semana.",
  },
  {
    icon: Users,
    titulo: "Creadores locales",
    texto:
      "Te formamos y te metemos en nuestra red para que, cuando se active el programa, ya tengas cartera de negocios de tu ciudad y sepas qué formato convierte en descubrimiento local.",
  },
  {
    icon: Rocket,
    titulo: "Marcas con red física",
    texto:
      "Franquicias y cadenas: diseñamos el playbook de TikTok Go para replicar en cada local, con creadores asignados por zona y medición por punto de venta.",
  },
];

const fases = [
  {
    titulo: "Fase 1 · Preparación (ahora)",
    texto:
      "Auditoría de tu presencia en TikTok, creación o ajuste de cuentas, primeros contenidos de descubrimiento local y captación de creadores de tu ciudad.",
  },
  {
    titulo: "Fase 2 · Aterrizaje del programa",
    texto:
      "Cuando TikTok habilite TikTok Go en España: alta del negocio, configuración de ofertas, activación de la red de creadores y primeras campañas.",
  },
  {
    titulo: "Fase 3 · Escala",
    texto:
      "Optimización semanal: qué creadores traen clientes, qué ofertas convierten y cómo bajar el coste por visita. Informes claros, sin humo.",
  },
];

const TikTokGo = () => (
  <>
    <SEO
      title="TikTok Go España — Agencia de comercio local en TikTok | TikShopTok"
      description="TikTok Go aún no ha llegado a España, pero llegará. Preparamos negocios locales y creadores para vender con el programa de descubrimiento local de TikTok desde el primer día."
      path={PATH}
      jsonLd={jsonLd}
    />
    <Navbar />

    <main className="mx-auto max-w-5xl px-4 pb-24 pt-32 md:px-8">
      <nav aria-label="Ruta de navegación" className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Inicio</Link>
        <span className="px-2">/</span>
        <span className="text-foreground">TikTok Go</span>
      </nav>

      <header className="max-w-3xl">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5 text-primary" />
          Próximamente en España
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.05] md:text-6xl">
          TikTok Go llegará a España. <span className="gradient-text">Llega preparado.</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          TikTok Go es el programa de comercio local de TikTok: negocios locales que aparecen en la app y creadores
          que los promocionan a comisión. Todavía no está disponible en España, pero cuando aterrice, los que hayan
          preparado su presencia y su red de creadores se llevarán la primera ola de clientes.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href="#lista-espera">
              Apuntarme a la lista de espera <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="/#contacto">Hablar con el equipo</a>
          </Button>
        </div>
      </header>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {paraQuien.map(({ icon: Icon, titulo, texto }) => (
          <article key={titulo} className="rounded-2xl border border-white/[0.07] bg-card/60 p-6">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-secondary/20">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold">{titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{texto}</p>
          </article>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Cómo lo trabajamos</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {fases.map((fase, i) => (
            <li key={fase.titulo} className="rounded-2xl border border-white/[0.07] bg-card/60 p-6">
              <span className="font-display text-xs text-primary">0{i + 1}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{fase.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{fase.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 rounded-3xl border border-white/[0.07] bg-card/60 p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold">Lo que preparamos antes del lanzamiento</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Presencia en TikTok lista para descubrimiento local",
            "Contenido de tu negocio grabado y publicado con creadores de tu zona",
            "Red de creadores locales activada y con acuerdos cerrados",
            "Oferta y precios pensados para conversión en la app",
            "Medición: saber qué creador y qué vídeo trae clientes",
            "Playbook listo para el alta el día que se abra el programa",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 shrink-0 text-secondary" /> {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Somos una agencia nativa de TikTok Shop: más de 100.000 productos vendidos y 1,2 M € facturados por
          creadores de nuestra red. TikTok Go es la extensión natural de ese trabajo hacia el comercio local.
        </p>
      </section>

      <section id="lista-espera" className="mt-16 scroll-mt-24">
        <div className="mb-6 max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Lista de espera
          </p>
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Sé de los primeros en España
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Apúntate y te avisaremos cuando TikTok Go se active en España, con una propuesta concreta para tu
            negocio o tu cuenta de creador.
          </p>
        </div>
        <TikTokGoWaitlist />
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">Preguntas frecuentes</h2>
        <dl className="mt-6 space-y-5">
          {jsonLd[2].mainEntity.map((faq) => (
            <div key={faq.name} className="border-b border-white/[0.06] pb-5">
              <dt className="font-semibold">{faq.name}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.acceptedAnswer.text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>

    <Footer />
  </>
);

export default TikTokGo;
