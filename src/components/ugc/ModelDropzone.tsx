import { useRef, useState } from "react";
import { Box } from "lucide-react";
import { MODEL_EXTENSIONS, isModelFile } from "@/lib/render3d";

type Props = {
  onFile: (file: File) => void;
  disabled?: boolean;
  title?: string;
  hint?: string;
};

const ACCEPT = MODEL_EXTENSIONS.map((e) => `.${e}`).join(",");

/** Zona para arrastrar un archivo 3D del producto (GLB, GLTF, OBJ, FBX o STL). */
const ModelDropzone = ({ onFile, disabled, title, hint }: Props) => {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (list: FileList | null) => {
    if (!list?.length) return;
    const model = Array.from(list).find(isModelFile);
    if (model) onFile(model);
  };

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
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
        <Box className={`h-5 w-5 ${over ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-sm font-medium">{title ?? "Arrastra el archivo 3D del producto"}</span>
        <span className="text-xs text-muted-foreground">{hint ?? "GLB, GLTF, OBJ, FBX o STL · máx. 60 MB"}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default ModelDropzone;
