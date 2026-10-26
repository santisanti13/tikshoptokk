import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar } from "lucide-react";
import { sanityClient } from "@/lib/sanity";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortableTextRenderer from "@/components/blog/PortableTextRenderer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const SITE = "https://tikshoptok.com";
const PATH = "/ranking-tiktok-shop-espana";

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "";

/** Página fija que siempre muestra el último Pulso diario: concentra la autoridad de toda la serie. */
const RankingTikTokShop = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["ranking-pulsos"],
    queryFn: () =>
      sanityClient.fetch(
        `*[_type == "post" && slug.current match "pulso-tiktok-shop-espana*"] | order(publishedAt desc)[0..14] {
          _id, title, excerpt, publishedAt, "slug": slug.current
        }`
      ),
  });
  const latestSlug = data?.[0]?.slug;
  const { data: latest } = useQuery({
    queryKey: ["ranking-latest", latestSlug],
    enabled: !!latestSlug,
    queryFn: () => sanityClient.fetch(`*[_type == "post" && slug.current == $s][0]{ body }`, { s: latestSlug }),
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Ranking TikTok Shop España",
      url: `${SITE}${PATH}`,
      dateModified: data?.[0]?.publishedAt,
      description: "Ranking diario de vídeos, tiendas y productos de TikTok Shop en España.",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Ranking TikTok Shop España", item: `${SITE}${PATH}` },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Ranking TikTok Shop España: tiendas, vídeos y productos (diario)"
        description="Ranking actualizado cada día de TikTok Shop España: vídeos con más engagement, tiendas líderes por GMV y señales de crecimiento."
        path={PATH}
        jsonLd={jsonLd}
      />
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-32 md:px-8">
        <nav aria-label="Ruta de navegación" className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Inicio</Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Ranking TikTok Shop España</span>
        </nav>
        <h1 className="font-display text-4xl font-bold leading-[1.05] md:text-6xl">Ranking TikTok Shop España</h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Vídeos con más engagement, tiendas líderes y señales de crecimiento. Se actualiza cada día con el último Pulso de TikShopTok.
        </p>
        {data?.[0] && (
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" /> Actualizado: {fmt(data[0].publishedAt)}
          </p>
        )}

        <article className="mt-10">
          {isLoading || !latest ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            latest.body && <PortableTextRenderer blocks={latest.body} />
          )}
        </article>

        <section className="bento mt-14 p-6">
          <h2 className="font-display text-2xl font-bold">¿Quieres que tu marca esté en este ranking?</h2>
          <p className="mt-2 text-muted-foreground">Montamos y operamos tu TikTok Shop con creadores afiliados y contenido que vende.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild><a href="/#contacto">Hablar con la agencia <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
            <Button asChild variant="outline"><Link to="/guias/como-vender-en-tiktok-shop-espana">Cómo vender en TikTok Shop</Link></Button>
          </div>
        </section>

        {data && data.length > 1 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold">Histórico del ranking</h2>
            <ul className="mt-4 divide-y divide-white/[0.06]">
              {data.slice(1).map((p: { _id: string; slug: string; title: string; publishedAt: string }) => (
                <li key={p._id} className="py-3">
                  <Link to={`/blog/${p.slug}`} className="text-sm hover:text-primary">{p.title}</Link>
                  <span className="ml-2 text-xs text-muted-foreground">{fmt(p.publishedAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default RankingTikTokShop;
