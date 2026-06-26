import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowUpRight } from "lucide-react";
import { urlFor } from "@/lib/sanity";

interface BlogCardProps {
  title: string;
  slug: string;
  excerpt: string;
  category?: string;
  publishedAt: string;
  mainImage?: { asset?: { _ref: string }; alt?: string };
}

const categoryLabels: Record<string, string> = {
  "tiktok-shop": "TikTok Shop",
  ugc: "UGC",
  "productos-virales": "Productos Virales",
  estrategia: "Estrategia",
};

const BlogCard = ({ title, slug, excerpt, category, publishedAt, mainImage }: BlogCardProps) => {
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <Link to={`/blog/${slug}`} className="group block h-full">
      <article className="bento bento-hover-pink flex h-full flex-col overflow-hidden">
        {mainImage?.asset && (
          <div className="aspect-video overflow-hidden rounded-t-[2rem]">
            <img
              src={urlFor(mainImage).width(600).height(340).fit("crop").auto("format").url()}
              alt={mainImage.alt || title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center gap-3">
            {category && (
              <Badge variant="secondary" className="rounded-full border-secondary/30 bg-secondary/10 text-secondary">
                {categoryLabels[category] || category}
              </Badge>
            )}
            {date && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> {date}
              </span>
            )}
          </div>
          <h3 className="mb-3 font-display text-xl font-bold leading-tight transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Leer más <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
