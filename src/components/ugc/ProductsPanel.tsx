import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, Loader2, Package, Plus, Trash2 } from "lucide-react";

export type UgcProduct = {
  id: string;
  name: string;
  description: string | null;
  image_path: string | null;
};

type Props = {
  products: UgcProduct[];
  onChanged: () => void;
};

const ProductsPanel = ({ products, onChanged }: Props) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    products
      .filter((p) => p.image_path && !thumbs[p.id])
      .forEach(async (p) => {
        const { data } = await supabase.storage.from("ugc-products").createSignedUrl(p.image_path!, 3600);
        if (data?.signedUrl) setThumbs((prev) => ({ ...prev, [p.id]: data.signedUrl }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  async function save() {
    if (name.trim().length < 2) {
      toast({ title: "Ponle un nombre al producto", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: session } = await supabase.auth.getUser();
    const userId = session.user!.id;

    let imagePath: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop() || "jpg";
      imagePath = `${userId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("ugc-products").upload(imagePath, file, { contentType: file.type });
      if (up.error) {
        setSaving(false);
        toast({ title: "No se pudo subir la foto", description: up.error.message, variant: "destructive" });
        return;
      }
    }

    const { error } = await supabase.from("ugc_products").insert({
      user_id: userId,
      name: name.trim(),
      description: description.trim() || null,
      image_path: imagePath,
    });
    setSaving(false);
    if (error) {
      toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
      return;
    }
    setName("");
    setDescription("");
    setFile(null);
    setPreview(null);
    onChanged();
    toast({ title: "Producto añadido", description: "Se adaptará al formato que elijas en cada vídeo." });
  }

  async function remove(product: UgcProduct) {
    if (product.image_path) await supabase.storage.from("ugc-products").remove([product.image_path]);
    const { error } = await supabase.from("ugc_products").delete().eq("id", product.id);
    if (error) {
      toast({ title: "No se pudo borrar", description: error.message, variant: "destructive" });
      return;
    }
    onChanged();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="font-display text-lg font-bold tracking-tight">Añadir producto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Guarda la foto y la ficha una vez; luego se reutiliza en cualquier vídeo y formato.
        </p>
        <div className="mt-5 space-y-4">
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
            <Label>Foto</Label>
            {preview ? (
              <div className="flex items-center gap-3">
                <img src={preview} alt="Foto del producto" className="h-20 w-20 rounded-xl object-cover" />
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview(null); }}>
                  Quitar
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => fileRef.current?.click()}>
                <ImagePlus className="mr-2 h-4 w-4" /> Subir foto
              </Button>
            )}
            <Input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) {
                  setFile(picked);
                  setPreview(URL.createObjectURL(picked));
                }
                e.target.value = "";
              }}
            />
          </div>
          <Button onClick={save} disabled={saving} className="rounded-full">
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
