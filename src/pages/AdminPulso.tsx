import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Copy } from "lucide-react";
import { FunctionsHttpError } from "@supabase/supabase-js";

type Snapshot = {
  id: string;
  captured_on: string;
  country: string;
  ranking_type: string;
  source: string;
  rows: Record<string, unknown>[];
};

const toMarkdown = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const head = `| ${keys.join(" | ")} |`;
  const sep = `| ${keys.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${keys.map((k) => String(r[k] ?? "")).join(" | ")} |`).join("\n");
  return [head, sep, body].join("\n");
};

const SnapshotTable = ({ snapshot }: { snapshot: Snapshot }) => {
  const { toast } = useToast();
  const rows = snapshot.rows ?? [];
  const keys = rows.length ? Object.keys(rows[0]) : [];
  return (
    <div className="bento p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">
            {snapshot.ranking_type === "videos" ? "Top vídeos" : "Top tiendas"} · {snapshot.country}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Capturado el {new Date(snapshot.captured_on).toLocaleDateString("es-ES")} ·{" "}
            <Badge variant="outline" className="text-[10px]">{snapshot.source}</Badge> · {rows.length} filas
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            void navigator.clipboard.writeText(toMarkdown(rows));
            toast({ title: "Tabla copiada", description: "Pégala en el post del blog." });
          }}
        >
          <Copy className="h-4 w-4" /> Copiar tabla
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {keys.map((k) => (
                <th key={k} className="whitespace-nowrap px-3 py-2 text-left">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-white/5">
                {keys.map((k) => (
                  <td key={k} className="whitespace-nowrap px-3 py-2">
                    {String(r[k] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminPulso = () => {
  const { toast } = useToast();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("market_snapshots")
      .select("id, captured_on, country, ranking_type, source, rows")
      .order("captured_on", { ascending: false })
      .limit(6);
    setSnapshots((data as unknown as Snapshot[] | null) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("fastmoss-rankings");
    setLoading(false);
    if (error) {
      const details = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
      console.error("fastmoss-rankings failed:", details);
      toast({
        title: "No se pudieron traer los datos",
        description: details.slice(0, 300),
        variant: "destructive",
      });
      return;
    }
    if (!data?.success) {
      toast({
        title: "FastMoss no devolvió datos",
        description: data?.error ?? "Revisa la credencial de FastMoss.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Datos actualizados",
      description: `Vídeos: ${data.counts?.videos ?? 0} · Tiendas: ${data.counts?.shops ?? 0}`,
    });
    void load();
  };

  return (
    <>
      <SEO
        title="Pulso de mercado — TikShopTok"
        description="Panel interno de datos de mercado."
        path="/admin/pulso"
        noindex
      />
      <Navbar />
      <main className="min-h-screen px-4 pt-28 pb-16 md:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="bento relative overflow-hidden p-8">
            <div className="neon-blob-cyan -left-10 -top-10 opacity-60" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">Interno</p>
                <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Pulso de mercado</h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Trae los rankings reales de TikTok Shop España desde FastMoss y quédate con la fecha de captura.
                </p>
              </div>
              <Button onClick={() => void refresh()} disabled={loading} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Trayendo datos…" : "Actualizar datos"}
              </Button>
            </div>
          </div>

          {snapshots.length ? (
            snapshots.map((s) => <SnapshotTable key={s.id} snapshot={s} />)
          ) : (
            <div className="bento p-8 text-center text-muted-foreground">
              Todavía no hay capturas. Pulsa «Actualizar datos».
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminPulso;
