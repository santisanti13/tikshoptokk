import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

type Props = {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  title?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
};

const ACCEPT = "image/png,image/jpeg,image/webp";

/** Zona para arrastrar y soltar imágenes; también acepta clic y pegar desde el portapapeles. */
const ImageDropzone = ({ onFiles, multiple = false, title, hint, disabled, className }: Props) => {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (list: FileList | null) => {
    if (!list) return;
    const images = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    onFiles(multiple ? images : images.slice(0, 1));
  };

  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onPaste={(e) => handle(e.clipboardData?.files ?? null)}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (!disabled) handle(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-6 text-center transition-colors disabled:opacity-40 ${
          over ? "border-primary bg-primary/10" : "border-white/15 bg-background/40 hover:border-primary/50"
        }`}
      >
        <ImagePlus className={`h-5 w-5 ${over ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-sm font-medium">{title ?? "Arrastra una imagen aquí"}</span>
        <span className="text-xs text-muted-foreground">
          {hint ?? "o haz clic para elegirla · JPG, PNG o WebP"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default ImageDropzone;
