import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import ImageDropzone from "@/components/ugc/ImageDropzone";

/** Un avatar es la persona que sale en tus vídeos: cara, look, voz y tono. */
export type UgcAvatar = {
  id: string;
  name: string;
  character_brief: string | null;
  tone: string | null;
  brand_notes: string | null;
  reference_image_path?: string | null;
};

type Props = {
  avatars: UgcAvatar[];
  onChanged: () => void;
};

const empty = { name: "", character_brief: "", tone: "", brand_notes: "" };

const AvatarsPanel = ({ avatars, onChanged }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    avatars
      .filter((p) => p.reference_image_path && !thumbs[p.id])
      .forEach(async (p) => {
        const { data } = await supabase.storage.from("ugc-products").createSignedUrl(p.reference_image_path!, 3600);
        if (data?.signedUrl) setThumbs((prev) => ({ ...prev, [p.id]: data.signedUrl }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatars]);

  function resetForm() {
    setEditingId(null);
    setForm(empty);
    setFile(null);
    setPreview(null);
  }

  // Editar un avatar ya creado: rellenamos el formulario con lo guardado.
  function startEdit(avatar: UgcAvatar) {
    setEditingId(avatar.id);
    setForm({
      name: avatar.name,
      character_brief: avatar.character_brief ?? "",
      tone: avatar.tone ?? "",
      brand_notes: avatar.brand_notes ?? "",
    });
    setFile(null);
    setPreview(thumbs[avatar.id] ?? null);
    document.getElementById("p-name")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function save() {
    if (form.name.trim().length < 2) {
      toast({ title: "Ponle un nombre al avatar", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: session } = await supabase.auth.getUser();
    const userId = session.user!.id;

    let referencePath: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop() || "jpg";
      referencePath = `${userId}/projects/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("ugc-products").upload(referencePath, file, { contentType: file.type });
      if (up.error) {
        setSaving(false);
        toast({ title: "No se pudo subir la imagen", description: up.error.message, variant: "destructive" });
        return;
      }
    }

    const fields = {
      name: form.name.trim(),
      character_brief: form.character_brief.trim() || null,
      tone: form.tone.trim() || null,
      brand_notes: form.brand_notes.trim() || null,
    };

    const wasEditing = Boolean(editingId);
    const { error } = wasEditing
      ? await supabase
          .from("ugc_projects")
          // La foto solo se sustituye si el usuario sube una nueva.
          .update(referencePath ? { ...fields, reference_image_path: referencePath } : fields)
          .eq("id", editingId!)
      : await supabase.from("ugc_projects").insert({
          user_id: userId,
          ...fields,
          reference_image_path: referencePath,
        });
    setSaving(false);
    if (error) {
      toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
      return;
    }
    resetForm();
    onChanged();
    toast({
      title: wasEditing ? "Avatar actualizado" : "Avatar creado",
      description: wasEditing
        ? "Los próximos vídeos usarán esta versión."
        : "Ya puedes crear vídeos con esta misma persona y su voz.",
    });
  }

  async function remove(avatar: UgcAvatar) {
    if (avatar.reference_image_path) await supabase.storage.from("ugc-products").remove([avatar.reference_image_path]);
    const { error } = await supabase.from("ugc_projects").delete().eq("id", avatar.id);
    if (error) {
      toast({ title: "No se pudo borrar", description: error.message, variant: "destructive" });
      return;
    }
    onChanged();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="studio-card p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-bold tracking-tight">
            {editingId ? "Editar avatar" : "Nuevo avatar"}
          </h2>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm} className="shrink-0">
              <X className="mr-1.5 h-3.5 w-3.5" /> Cancelar
            </Button>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {editingId
            ? "Cambia el nombre, el look, el tono o la foto. La foto solo se sustituye si subes otra."
            : "El avatar es quien aparece y habla en tus vídeos. Al reutilizarlo, todas tus piezas parecen de la misma cuenta."}
        </p>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Nombre del avatar</Label>
            <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lucía · cosmética" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-char">Cómo es y cómo habla</Label>
            <Textarea
              id="p-char"
              rows={4}
              value={form.character_brief}
              onChange={(e) => setForm({ ...form, character_brief: e.target.value })}
              placeholder="Chica española de 24 años, pelo castaño ondulado a media espalda, ojos marrones, camiseta blanca básica, maquillaje natural, voz cercana y alegre."
            />
          </div>
          <div className="space-y-2">
            <Label>Foto del avatar</Label>
            {preview ? (
              <div className="flex items-center gap-3">
                <img src={preview} alt="Foto del avatar" className="h-20 w-20 rounded-xl object-cover" />
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview(null); }}>
                  Quitar
                </Button>
              </div>
            ) : (
              <ImageDropzone
                title="Arrastra la cara o el look del avatar"
                hint="o haz clic para elegirla · se usará en cada vídeo con este avatar"
                onFiles={(files) => {
                  setFile(files[0]);
                  setPreview(URL.createObjectURL(files[0]));
                }}
              />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-tone">Tono</Label>
              <Input id="p-tone" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} placeholder="Cercano, directo, sin postureo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-notes">Notas de marca</Label>
              <Input id="p-notes" value={form.brand_notes} onChange={(e) => setForm({ ...form, brand_notes: e.target.value })} placeholder="Siempre acaba invitando a mirar el enlace" />
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Crear avatar
          </Button>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-bold tracking-tight">Tus avatares</h2>
        <div className="mt-4 space-y-3">
          {avatars.length === 0 && <p className="text-sm text-muted-foreground">Todavía no tienes avatares.</p>}
          {avatars.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-card/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  {thumbs[p.id] && (
                    <img src={thumbs[p.id]} alt={`Avatar ${p.name}`} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  )}
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <UserRound className="h-4 w-4 text-primary" /> {p.name}
                    </p>
                    {p.character_brief && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{p.character_brief}</p>}
                    {p.tone && <p className="mt-1 text-xs text-muted-foreground">Tono: {p.tone}</p>}
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

export default AvatarsPanel;
