import ugc05 from "@/assets/ugc/drive-ugc-05.mp4.asset.json";
import ugc03 from "@/assets/ugc/drive-ugc-03.mp4.asset.json";
import ugcNana from "@/assets/ugc/drive-ugc-nana.mp4.asset.json";

const sampleVideos = [
  { src: ugcNana.url, status: "Listo", label: "UGC · Nana" },
  { src: ugc03.url, status: "Listo", label: "UGC 03" },
  { src: ugc05.url, status: "Listo", label: "UGC 05" },
];

const StudioPreview = () => {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-secondary" />
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">Mis vídeos</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] font-semibold text-foreground">
          86 tokens
        </span>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-2">
        {sampleVideos.map((video) => (
          <div
            key={video.src}
            className="group relative overflow-hidden rounded-md border border-border bg-card"
          >
            <video
              src={video.src}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute left-2 top-2 max-w-[85%] truncate rounded-sm bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white/90 backdrop-blur-sm">
              {video.label}
            </span>
            <span className="absolute bottom-2 left-2 rounded-sm bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
              {video.status}
            </span>
          </div>
        ))}

        <div className="flex flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed border-secondary/40 bg-card/60 p-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
          </span>
          <span className="text-center text-[10px] font-medium leading-tight text-muted-foreground">
            Generando tu vídeo…
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">Coste por vídeo</div>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="font-display text-4xl font-bold tracking-tighter text-secondary md:text-5xl">-90%</span>
          <span className="text-sm font-medium text-muted-foreground">frente a un creador tradicional</span>
        </div>
        <div className="mt-3 h-1 w-full max-w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[90%] bg-secondary" />
        </div>
      </div>
    </div>
  );
};

export default StudioPreview;
