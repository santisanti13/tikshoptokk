import { useEffect, useState } from "react";
import ImageDropzone from "@/components/ugc/ImageDropzone";
import ModelDropzone from "@/components/ugc/ModelDropzone";
import TikTokLinkInput from "@/components/ugc/TikTokLinkInput";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Box, Eye, Loader2, Package, Plus, Trash2 } from "lucide-react";
import { BLIND_SPOTS } from "@/lib/ugcBlindSpots";
import { renderModelViews } from "@/lib/render3d";

export type UgcProduct = {
  id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  blind_spots?: string | null;
  source_url?: string | null;
  model_path?: string | null;
  render_paths?: string[] | null;
};

type Props = {
  products: UgcProduct[];
  onChanged: () => void;
};

const dataUrlToFile = (data: string, mimeType: string, name: string): File => {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: mimeType });
};

const ProductsPanel = ({ products, onChanged }: Props) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [blindSpots, setBlindSpots] = useState("");
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [renders, setRenders] = useState<File[]>([]);
  const [rendering, setRendering] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    products
      .filter((p) => p.image_path && !thumbs[p.id])
      .forEach(async (p) => {
        const { data } = await supabase.storage.from("ugc-products").createSignedUrl(p.image_path!, 3600);
        if (data?.signedUrl) setThumbs((prev) => ({ ...prev, [p.id]: data.signedUrl }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  function addBlindSpot(template: string) {
    setBlindSpots((prev) => (prev.includes(template.split(":")[0]) ? prev : (prev ? `${prev}\n${template}` : template)));
  }

  // Al soltar un 3D lo renderizamos en varias vistas: son las imágenes que
  // entiende el modelo de vídeo.
  async function pickModel(f: File) {
    if (f.size > 60 * 1024 * 1024) {
      toast({ title: "Archivo 3D demasiado grande", description: "Usa un archivo de menos de 60 MB.", variant: "destructive" });
      return;
    }
    setRendering(true);
    try {
      const views = await renderModelViews(f);
      setModelFile(f);
      setRenders(views);
      if (!preview) setPreview(URL.createObjectURL(views[0]));
      toast({
        title: `3D leído: ${views.length} vistas`,
        description: "Usaremos estas vistas para que el producto salga igual desde cualquier ángulo.",
      });
    } catch {
      toast({
        title: "No se pudo abrir el 3D",
        description: "Prueba a exportarlo en GLB, o sube fotos del producto desde varios ángulos.",
        variant: "destructive",
      });
    } finally {
      setRendering(false);
    }
  }

  async function save() {
    if (name.trim().length < 2) {
      toast({ title: "Ponle un nombre al producto", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: session } = await supabase.auth.getUser();
    const userId = session.user!.id;

    const upload = async (f: File, ext?: string) => {
      const extension = ext ?? f.name.split(".").pop() ?? "bin";
      const path = `${userId}/${crypto.randomUUID()}.${extension}`;
      const up = await supabase.storage.from("ugc-products").upload(path, f, { contentType: f.type || "application/octet-stream" });
      if (up.error) throw new Error(up.error.message);
      return path;
    };

    try {
      const imagePath = file ? await upload(file) : renders[0] ? await upload(renders[0], "jpg") : null;
      const modelPath = modelFile ? await upload(modelFile) : null;
      const renderPaths: string[] = [];
      for (const view of renders.slice(0, 5)) renderPaths.push(await upload(view, "jpg"));

      const { error } = await supabase.from("ugc_products").insert({
        user_id: userId,
        name: name.trim(),
        description: description.trim() || null,
        blind_spots: blindSpots.trim() || null,
        source_url: sourceUrl,
        image_path: imagePath,
        model_path: modelPath,
        render_paths: renderPaths,
      });
      if (error) throw new Error(error.message);
    } catch (e) {
      setSaving(false);
      toast({ title: "No se pudo guardar", description: e instanceof Error ? e.message : "Inténtalo de nuevo.", variant: "destructive" });
      return;
    }

    setSaving(false);
    setName("");
    setDescription("");
    setBlindSpots("");
    setSourceUrl(null);
    setFile(null);
    setPreview(null);
    setModelFile(null);
    setRenders([]);
    onChanged();
    toast({ title: "Producto añadido", description: "Se adaptará al formato que elijas en cada vídeo." });
  }

  async function remove(product: UgcProduct) {
    const paths = [product.image_path, product.model_path, ...(product.render_paths ?? [])].filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("ugc-products").remove(paths);
    const { error } = await supabase.from("ugc_products").delete().eq("id", product.id);
    if (error) {
      toast({ title: "No se pudo borrar", description: error.message, variant: "destructive" });
      return;
    }
    onChanged();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="studio-card p-5 lg:p-6">
        <h2 className="font-display text-lg font-bold tracking-tight">Añadir producto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Guarda la foto y la ficha una vez; luego se reutiliza en cualquier vídeo y formato.
        </p>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <TikTokLinkInput
              mode="product"
              placeholder="https://shop.tiktok.com/view/product/… o enlace de vídeo"
              hint="Vale la página del producto de TikTok Shop o un vídeo. Rellenamos nombre, ficha, precio y foto."
              onLoaded={(ref) => {
                if (ref.title) setName((prev) => prev || ref.title!.slice(0, 80));
                if (ref.description) {
                  setDescription((prev) => prev || [ref.description, ref.price ? `Precio: ${ref.price}.` : ""].filter(Boolean).join(" "));
                }
                setSourceUrl(ref.url);
                if (ref.image) {
                  const imported = dataUrlToFile(ref.image.data, ref.image.mimeType, "tiktok.jpg");
                  setFile(imported);
                  setPreview(URL.createObjectURL(imported));
                }
                if (!ref.blocked) {
                  toast({ title: "Ficha traída de TikTok", description: "Revísala y completa los puntos ciegos." });
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pr-name">Nombre</Label>
            <Input id="pr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sérum de vitamina C 30 ml" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pr-desc">Qué destacar</Label>
            <Textarea
              id="pr-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Textura ligera, absorción rápida, se nota en 2 semanas. Precio 19,90 €."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pr-blind" className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-primary" /> Puntos ciegos del producto
            </Label>
            <p className="text-xs text-muted-foreground">
              Lo que la foto no muestra y la IA se inventaría: color del interior, densidad del material, qué hay dentro…
              Toca un punto para añadir la línea y rellena los corchetes.
            </p>
            <div className="flex flex-wrap gap-2">
              {BLIND_SPOTS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => addBlindSpot(b.template)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  + {b.label}
                </button>
              ))}
            </div>
            <Textarea
              id="pr-blind"
              rows={4}
              value={blindSpots}
              onChange={(e) => setBlindSpots(e.target.value)}
              placeholder="Interior / forro: color gris claro y acabado mate."
            />
          </div>

          <div className="space-y-2">
            <Label>Foto</Label>
            {preview ? (
              <div className="flex items-center gap-3">
                <img src={preview} alt="Foto del producto" className="h-20 w-20 rounded-xl object-cover" />
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview(null); }}>
                  Quitar
                </Button>
              </div>
            ) : (
              <ImageDropzone
                title="Arrastra la foto del producto"
                onFiles={(files) => {
                  setFile(files[0]);
                  setPreview(URL.createObjectURL(files[0]));
                }}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Box className="h-3.5 w-3.5 text-primary" /> Modelo 3D (opcional)
            </Label>
            {renders.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {renders.map((r, i) => (
                    <img key={i} src={URL.createObjectURL(r)} alt={`Vista 3D ${i + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setModelFile(null); setRenders([]); }}>
                  Quitar 3D
                </Button>
              </div>
            ) : (
              <ModelDropzone onFile={pickModel} disabled={rendering} />
            )}
            {rendering && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Leyendo el 3D y sacando vistas…
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Del archivo 3D sacamos vistas fijas del producto (frontal, tres cuartos, lateral, trasera y superior) y se las
              pasamos al modelo de vídeo, que no entiende geometría 3D pero sí imágenes.
            </p>
          </div>

          <Button onClick={save} disabled={saving || rendering} className="rounded-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Guardar producto
          </Button>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-bold tracking-tight">Tu biblioteca</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {products.length === 0 && <p className="text-sm text-muted-foreground">Todavía no has añadido productos.</p>}
          {products.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-card/60 p-4">
              {thumbs[p.id] ? (
                <img src={thumbs[p.id]} alt={p.name} className="h-28 w-full rounded-xl object-cover" />
              ) : (
                <div className="flex h-28 w-full items-center justify-center rounded-xl border border-white/5 bg-background/40">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  {p.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(p.render_paths?.length ?? 0) > 0 && (
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
                        3D · {p.render_paths!.length} vistas
                      </span>
                    )}
                    {p.blind_spots && (
                      <span className="rounded-full border border-primary/30 px-2 py-0.5 text-[10px] text-primary">
                        puntos ciegos
                      </span>
                    )}
                    {p.source_url && (
                      <a
                        href={p.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        TikTok
                      </a>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(p)} aria-label={`Borrar ${p.name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPanel;
