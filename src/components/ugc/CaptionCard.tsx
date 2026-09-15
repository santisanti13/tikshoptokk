import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Caption = {
  title: string;
  description: string;
  hashtags: string[];
  card: string;
};

const CopyRow = ({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) => {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-background/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={`mt-1 text-sm ${multiline ? "whitespace-pre-line" : "truncate"}`}>{value}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="shrink-0 rounded-full"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

/** Ficha lista para pegar en TikTok: título, descripción con hashtags y nombre de la tarjeta. */
const CaptionCard = ({ caption, title = "Ficha para publicar" }: { caption: Caption; title?: string }) => {
  const description = [caption.description, caption.hashtags.join(" ")].filter(Boolean).join("\n\n");
  return (
    <div className="space-y-3">
      <p className="font-display text-sm font-bold tracking-tight">{title}</p>
      <CopyRow label="Título" value={caption.title} />
      <CopyRow label="Descripción y hashtags" value={description} multiline />
      <CopyRow label={`Tarjeta de producto (${caption.card.length}/30)`} value={caption.card} />
    </div>
  );
};

export default CaptionCard;
