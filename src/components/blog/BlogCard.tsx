import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface BlogCardProps {
  title: string;
  slug: string;
  excerpt: string;
  category?: string;
  publishedAt: string;
}

const categoryLabels: Record<string, string> = {
  "tiktok-shop": "TikTok Shop",
  ugc: "UGC",
  "productos-virales": "Productos Virales",
  estrategia: "Estrategia",
};

const BlogCard = ({ title, slug, excerpt, category, publishedAt }: BlogCardProps) => {
  const date = new Date(publishedAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link to={`/blog/${slug}`}>
      <Card className="group h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        <CardContent className="flex h-full flex-col p-6">
          <div className="mb-3 flex items-center gap-3">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[category] || category}
              </Badge>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {date}
            </span>
          </div>
          <h3 className="mb-3 font-display text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
            {excerpt}
          </p>
          <span className="mt-4 text-sm font-medium text-primary">
            Leer más →
          </span>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;
