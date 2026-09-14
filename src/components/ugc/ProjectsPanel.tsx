import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import ImageDropzone from "@/components/ugc/ImageDropzone";

export type UgcProject = {
  id: string;
  name: string;
  character_brief: string | null;
  tone: string | null;
  brand_notes: string | null;
  reference_image_path?: string | null;
};

type Props = {
  projects: UgcProject[];
  onChanged: () => void;
};

const empty = { name: "", character_brief: "", tone: "", brand_notes: "" };

const ProjectsPanel = ({ projects, onChanged }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    projects
      .filter((p) => p.reference_image_path && !thumbs[p.id])
      .forEach(async (p) => {
        const { data } = await supabase.storage.from("ugc-products").createSignedUrl(p.reference_image_path!, 3600);
        if (data?.signedUrl) setThumbs((prev) => ({ ...prev, [p.id]: data.signedUrl }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  async function save() {
    if (form.name.trim().length < 2) {
      toast({ title: "Ponle un nombre al proyecto", variant: "destructive" });
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

    const { error } = await supabase.from("ugc_projects").insert({
      user_id: userId,
      name: form.name.trim(),
      character_brief: form.character_brief.trim() || null,
      tone: form.tone.trim() || null,
      brand_notes: form.brand_notes.trim() || null,
      reference_image_path: referencePath,
    });
    setSaving(false);
    if (error) {
      toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
      return;
    }
    setForm(empty);
    setFile(null);
    setPreview(null);
    onChanged();
    toast({ title: "Proyecto creado", description: "Ya puedes generar vídeos con el mismo personaje." });
  }

  async function remove(project: UgcProject) {
    if (project.reference_image_path) await supabase.storage.from("ugc-products").remove([project.reference_image_path]);
    const { error } = await supabase.from("ugc_projects").delete().eq("id", project.id);
    if (error) {
      toast({ title: "No se pudo borrar", description: error.message, variant: "destructive" });
      return;
    }
    onChanged();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="font-display text-lg font-bold tracking-tight">Nuevo proyecto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Un proyecto fija el personaje y el tono para que todos tus vídeos parezcan de la misma cuenta.
        </p>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Nombre</Label>
            <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cuenta de cosmética — Lucía" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-char">Personaje</Label>
            <Textarea
              id="p-char"
              rows={4}
              value={form.character_brief}
              onChange={(e) => setForm({ ...form, character_brief: e.target.value })}
              placeholder="Chica española de 24 años, pelo castaño ondulado a media espalda, ojos marrones, camiseta blanca básica, maquillaje natural, voz cercana y alegre."
            />
          </div>
          <div className="space-y-2">
            <Label>Imagen de referencia del personaje</Label>
            {preview ? (
              <div className="flex items-center gap-3">
                <img src={preview} alt="Referencia del personaje" className="h-20 w-20 rounded-xl object-cover" />
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview(null); }}>
                  Quitar
                </Button>
              </div>
            ) : (
              <ImageDropzone
                title="Arrastra la cara o el look del personaje"
                hint="o haz clic para elegirla · se usará en cada vídeo del proyecto"
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
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Crear proyecto
          </Button>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-bold tracking-tight">Tus proyectos</h2>
        <div className="mt-4 space-y-3">
          {projects.length === 0 && <p className="text-sm text-muted-foreground">Todavía no tienes proyectos.</p>}
          {projects.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-card/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  {thumbs[p.id] && (
                    <img src={thumbs[p.id]} alt={`Personaje de ${p.name}`} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  )}
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <Users className="h-4 w-4 text-primary" /> {p.name}
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

export default ProjectsPanel;
