import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import ImageDropzone from "@/components/ugc/ImageDropzone";

export type UgcCharacter = {
  id: string;
  name: string;
  image_path: string;
};

type Props = {
  characters: UgcCharacter[];
  onChanged: () => void;
  onUse: (file: File, name: string) => void;
  activeId: string | null;
};

/** Biblioteca de caras y personas de referencia: se arrastran aquí y se reutilizan en cada vídeo. */
const CharactersStrip = ({ characters, onChanged, onUse, activeId }: Props) => {
  const { toast } = useToast();
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [usingId, setUsingId] = useState<string | null>(null);

  useEffect(() => {
    characters
      .filter((c) => !thumbs[c.id])
      .forEach(async (c) => {
        const { data } = await supabase.storage.from("ugc-products").createSignedUrl(c.image_path, 3600);
        if (data?.signedUrl) setThumbs((prev) => ({ ...prev, [c.id]: data.signedUrl }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters]);

  async function upload(files: File[]) {
    setUploading(true);
    const { data: session } = await supabase.auth.getUser();
    const userId = session.user!.id;
    for (const file of files) {
      if (file.size > 8 * 1024 * 1024) {
        toast({ title: `${file.name} pesa demasiado`, description: "Usa imágenes de menos de 8 MB.", variant: "destructive" });
        continue;
      }
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/characters/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("ugc-products").upload(path, file, { contentType: file.type });
      if (up.error) {
        toast({ title: "No se pudo subir la imagen", description: up.error.message, variant: "destructive" });
        continue;
      }
      const name = file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "Personaje";
      const { error } = await supabase.from("ugc_characters").insert({ user_id: userId, name, image_path: path });
      if (error) {
        toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
      }
    }
    setUploading(false);
    onChanged();
  }

  async function use(character: UgcCharacter) {
    const url = thumbs[character.id];
    if (!url) return;
    setUsingId(character.id);
    try {
      const blob = await (await fetch(url)).blob();
      onUse(new File([blob], `${character.name}.jpg`, { type: blob.type || "image/jpeg" }), character.name);
    } catch {
      toast({ title: "No se pudo cargar la imagen", variant: "destructive" });
    } finally {
      setUsingId(null);
    }
  }

  async function remove(character: UgcCharacter) {
    await supabase.storage.from("ugc-products").remove([character.image_path]);
    const { error } = await supabase.from("ugc_characters").delete().eq("id", character.id);
    if (error) {
      toast({ title: "No se pudo borrar", description: error.message, variant: "destructive" });
      return;
    }
    onChanged();
  }

  return (
    <div className="space-y-2">
      <Label>Personajes de referencia</Label>
      <p className="text-xs text-muted-foreground">
        Arrastra aquí caras o fotos de cuerpo entero y reutilízalas: el vídeo mantendrá la misma persona y voz.
      </p>

      {characters.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {characters.map((c) => (
            <div key={c.id} className="relative">
              <button
                type="button"
                onClick={() => use(c)}
                disabled={usingId === c.id}
                className={`block overflow-hidden rounded-2xl border transition-colors ${
                  activeId === c.id ? "border-primary" : "border-white/10 hover:border-primary/50"
                }`}
                title={`Usar ${c.name}`}
              >
                {thumbs[c.id] ? (
                  <img src={thumbs[c.id]} alt={c.name} className="h-20 w-20 object-cover" />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center bg-background/40">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </span>
                )}
              </button>
              {usingId === c.id && (
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-background/80"
                onClick={() => remove(c)}
                aria-label={`Borrar ${c.name}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ImageDropzone
        multiple
        disabled={uploading}
        title={uploading ? "Guardando…" : "Arrastra caras o personas aquí"}
        hint="puedes soltar varias a la vez · se guardan para todos tus vídeos"
        onFiles={upload}
      />
    </div>
  );
};

export default CharactersStrip;
