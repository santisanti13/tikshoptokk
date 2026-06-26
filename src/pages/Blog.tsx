import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/blog/BlogCard";
import { Skeleton } from "@/components/ui/skeleton";

const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id, title, "slug": slug.current, excerpt, category, publishedAt, mainImage
}`;

const Blog = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => sanityClient.fetch(POSTS_QUERY),
  });

  return (
    <>
      <SEO
        title="Blog de TikTok Shop — Guías, UGC y productos virales"
        description="Estrategias, casos y tendencias sobre TikTok Shop, creadores UGC y productos virales. Aprende a vender más en TikTok con TikShopTok."
        path="/blog"
      />
      <Navbar />
      <main className="min-h-screen px-4 pt-28 pb-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="bento relative mb-10 overflow-hidden p-8 md:p-12">
            <div className="neon-blob-pink -right-10 -top-10 opacity-70" />
            <div className="neon-blob-cyan -bottom-20 -left-10 opacity-40" />
            <div className="relative">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">Blog</p>
              <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                Insights de <span className="gradient-text">TikTok Shop</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                Guías, estrategias y tendencias sobre TikTok Shop, UGC y productos virales.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 rounded-[2rem]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts?.map((post: { _id: string; title: string; slug: string; excerpt: string; category: string; publishedAt: string; mainImage?: { asset?: { _ref: string }; alt?: string } }) => (
                <BlogCard
                  key={post._id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  category={post.category}
                  publishedAt={post.publishedAt}
                  mainImage={post.mainImage}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Blog;
