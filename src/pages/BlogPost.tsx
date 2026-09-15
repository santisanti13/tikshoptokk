import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { sanityClient, urlFor } from "@/lib/sanity";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortableTextRenderer from "@/components/blog/PortableTextRenderer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar } from "lucide-react";

const categoryLabels: Record<string, string> = {
  "tiktok-shop": "TikTok Shop",
  ugc: "UGC",
  "productos-virales": "Productos Virales",
  estrategia: "Estrategia",
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () =>
      sanityClient.fetch(
        `*[_type == "post" && slug.current == $slug][0] {
          _id, title, publishedAt, excerpt, category, tags, body, mainImage
        }`,
        { slug }
      ),
    enabled: !!slug,
  });

  const seoTitle = post?.title ? `${post.title} — Blog TikShopTok` : "Cargando artículo — Blog TikShopTok";
  const seoDescription = post?.excerpt || "Artículo del blog de TikShopTok sobre TikTok Shop, UGC y productos virales.";
  const seoImage = post?.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : undefined;
  const canonicalUrl = `https://tikshoptok.com/blog/${slug ?? ""}`;

  const articleLd = post
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: seoImage,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        url: canonicalUrl,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
        author: {
          "@type": "Organization",
          name: "TikShopTok",
          url: "https://tikshoptok.com",
        },
        publisher: {
          "@type": "Organization",
          name: "TikShopTok",
          logo: {
            "@type": "ImageObject",
            url: "https://tikshoptok.com/favicon.svg",
          },
        },
      })
    : null;

  return (
    <>
      <SEO
        title={seoTitle.length > 60 ? `${post?.title?.slice(0, 55)}…` : seoTitle}
        description={seoDescription.slice(0, 160)}
        path={`/blog/${slug ?? ""}`}
        type="article"
        image={seoImage}
      />
      {articleLd && (
        <Helmet>
          <script type="application/ld+json">{articleLd}</script>
        </Helmet>
      )}
      <Navbar />
      <main className="min-h-screen px-4 pt-28 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al blog
          </Link>

          {isLoading ? (
            <div className="bento space-y-4 p-8">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-96 w-full" />
            </div>
          ) : post ? (
            <article className="bento overflow-hidden">
              {post.mainImage?.asset && (
                <div className="aspect-[21/9] overflow-hidden">
                  <img
                    src={urlFor(post.mainImage).width(1200).height(514).fit("crop").auto("format").url()}
                    alt={post.mainImage.alt || post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-8 md:p-12">
                <header className="mb-8">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    {post.category && (
                      <Badge variant="secondary" className="rounded-full border-secondary/30 bg-secondary/10 text-secondary">
                        {categoryLabels[post.category] || post.category}
                      </Badge>
                    )}
                    {post.publishedAt && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.publishedAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                    {post.title}
                  </h1>
                  {post.tags && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {post.tags.map((tag: string) => (
                        <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </header>
                {post.body && <PortableTextRenderer blocks={post.body} />}
              </div>
            </article>
          ) : (
            <div className="bento p-12 text-center">
              <h2 className="font-display text-2xl font-bold">Artículo no encontrado</h2>
              <Link to="/blog" className="mt-4 inline-block text-primary hover:underline">Volver al blog</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
