import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { sanityClient, urlFor } from "@/lib/sanity";
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Link
              to="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Link>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-96 w-full" />
              </div>
            ) : post ? (
              <article>
                <header className="mb-10">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    {post.category && (
                      <Badge variant="secondary">
                        {categoryLabels[post.category] || post.category}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.publishedAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
                    {post.title}
                  </h1>
                  {post.tags && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </header>

                {post.mainImage?.asset && (
                  <div className="mb-10 overflow-hidden rounded-lg">
                    <img
                      src={urlFor(post.mainImage).width(800).height(450).fit("crop").auto("format").url()}
                      alt={post.mainImage.alt || post.title}
                      className="w-full object-cover"
                    />
                  </div>
                )}

                {post.body && <PortableTextRenderer blocks={post.body} />}
              </article>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Artículo no encontrado</h2>
                <Link to="/blog" className="mt-4 text-primary hover:underline">
                  Volver al blog
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
