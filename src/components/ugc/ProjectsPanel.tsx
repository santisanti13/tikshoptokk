import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Users } from "lucide-react";

export type UgcProject = {
  id: string;
  name: string;
  character_brief: string | null;
  tone: string | null;
  brand_notes: string | null;
};

type Props = {
  projects: UgcProject[];
  onChanged: () => void;
};

const empty = { name: "", character_brief: "", tone: "", brand_notes: "" };

const ProjectsPanel = ({ projects, onChanged }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (form.name.trim().length < 2) {
      toast({ title: "Ponle un nombre al proyecto", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: session } = await supabase.auth.getUser();
    const { error } = await supabase.from("ugc_projects").insert({
      user_id: session.user!.id,
      name: form.name.trim(),
      character_brief: form.character_brief.trim() || null,
      tone: form.tone.trim() || null,
      brand_notes: form.brand_notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
      return;
    }
    setForm(empty);
    onChanged();
    toast({ title: "Proyecto creado", description: "Ya puedes generar vídeos con el mismo personaje." });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("ugc_projects").delete().eq("id", id);
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
            <Plus className="mr-2 h-4 w-4" /> Crear proyecto
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
                <div>
                  <p className="flex items-center gap-2 font-medium">
                    <Users className="h-4 w-4 text-primary" /> {p.name}
                  </p>
                  {p.character_brief && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{p.character_brief}</p>}
                  {p.tone && <p className="mt-1 text-xs text-muted-foreground">Tono: {p.tone}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(p.id)} aria-label={`Borrar ${p.name}`}>
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
