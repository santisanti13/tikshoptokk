import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/blog/BlogCard";
import { Skeleton } from "@/components/ui/skeleton";

const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  publishedAt
}`;

const Blog = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => sanityClient.fetch(POSTS_QUERY),
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              <span className="text-foreground">Nuestro </span>
              <span className="text-primary">Blog</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Guías, estrategias y tendencias sobre TikTok Shop, UGC y productos virales.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts?.map((post: { _id: string; title: string; slug: string; excerpt: string; category: string; publishedAt: string }) => (
                <BlogCard
                  key={post._id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  category={post.category}
                  publishedAt={post.publishedAt}
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
