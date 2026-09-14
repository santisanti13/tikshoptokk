import { Button } from "@/components/ui/button";
import { AlertCircle, Coins, Copy, Download, Loader2, Play, UserCheck } from "lucide-react";

export type VideoRow = {
  id: string;
  prompt: string;
  status: string;
  error_message: string | null;
  resolution: string;
  duration_seconds: number;
  aspect_ratio: string | null;
  video_path: string | null;
  tokens_charged: number | null;
  created_at: string;
  project_id?: string | null;
  product_id?: string | null;
};

type Props = {
  videos: VideoRow[];
  urls: Record<string, string>;
  onReuse?: (video: VideoRow) => void;
  onKeepIdentity?: (video: VideoRow) => void;
  keepingId?: string | null;
};

const statusLabel = (status: string) =>
  status === "completed" ? "Listo" : status === "failed" ? "Error" : "Generando";

const VideoGallery = ({ videos, urls, onReuse, onKeepIdentity, keepingId }: Props) => {
  if (videos.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-card/40 p-10 text-center">
        <Play className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Aquí aparecerán tus vídeos. Genera el primero desde el panel de la izquierda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {videos.map((v) => {
        const vertical = v.aspect_ratio !== "16:9";
        return (
          <article
            key={v.id}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl transition-colors hover:border-primary/40"
          >
            <div className={`relative w-full bg-black ${vertical ? "aspect-[9/16]" : "aspect-video"}`}>
              {v.status === "completed" && urls[v.id] ? (
                <video
                  src={urls[v.id]}
                  controls
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-card to-background/80 text-center">
                  {v.status === "failed" ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <p className="px-4 text-xs text-muted-foreground">{v.error_message ?? "No se pudo generar."}</p>
                      <p className="text-[11px] text-primary">Tokens devueltos</p>
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-xs text-muted-foreground">Generando… 1-3 min</p>
                    </>
                  )}
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2 py-0.5 text-[11px] backdrop-blur">
                {statusLabel(v.status)}
              </span>
            </div>

            <div className="space-y-3 p-4">
              <p className="line-clamp-2 text-xs text-muted-foreground">{v.prompt}</p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-full border border-white/10 px-2 py-0.5">{v.aspect_ratio ?? "9:16"}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">{v.resolution}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">{v.duration_seconds}s</span>
                {Boolean(v.tokens_charged) && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-primary">
                    <Coins className="h-3 w-3" /> {v.tokens_charged}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {new Date(v.created_at).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                {v.status === "completed" && urls[v.id] && (
                  <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-3">
                    <a href={urls[v.id]} download={`ugc-${v.id}.mp4`}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Descargar
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default VideoGallery;
