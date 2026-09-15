import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Coins, Minus, Plus, Search, RefreshCw } from "lucide-react";

type AdminUser = {
  user_id: string;
  email: string | null;
  balance_tokens: number | null;
  plan: string | null;
  renews_at: string | null;
};

type LedgerRow = {
  id: string;
  user_id: string;
  delta_tokens: number;
  reason: string;
  video_id: string | null;
  created_at: string;
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }) : "—";

const AdminTokens = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [amount, setAmount] = useState("100");
  const [reason, setReason] = useState("Carga manual");
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);

  const loadUsers = useCallback(
    async (term: string) => {
      setLoading(true);
      const { data, error } = await supabase.rpc("admin_find_users", { _search: term });
      setLoading(false);
      if (error) {
        toast({ title: "No se pudo buscar", description: error.message, variant: "destructive" });
        return;
      }
      const rows = (data as AdminUser[] | null) ?? [];
      setUsers(rows);
      setSelected((prev) => rows.find((r) => r.user_id === prev?.user_id) ?? prev ?? rows[0] ?? null);
    },
    [toast],
  );

  const loadLedger = useCallback(async (userId: string | null) => {
    let query = supabase
      .from("ugc_token_ledger")
      .select("id, user_id, delta_tokens, reason, video_id, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (userId) query = query.eq("user_id", userId);
    const { data } = await query;
    setLedger((data as LedgerRow[] | null) ?? []);
  }, []);

  useEffect(() => {
    void loadUsers("");
  }, [loadUsers]);

  useEffect(() => {
    void loadLedger(selected?.user_id ?? null);
  }, [selected?.user_id, loadLedger]);

  const adjust = async (sign: 1 | -1) => {
    if (!selected) return;
    const parsed = Number.parseInt(amount, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast({ title: "Cantidad no válida", description: "Escribe un número mayor que 0.", variant: "destructive" });
      return;
    }
    setWorking(true);
    const { data, error } = await supabase.rpc("ugc_admin_adjust_tokens", {
      _user_id: selected.user_id,
      _delta: parsed * sign,
      _reason: reason.trim() || (sign > 0 ? "Carga manual" : "Ajuste manual"),
    });
    setWorking(false);
    if (error) {
      toast({ title: "No se pudo ajustar", description: error.message, variant: "destructive" });
      return;
    }
    const newBalance = typeof data === "number" ? data : null;
    setSelected({ ...selected, balance_tokens: newBalance ?? selected.balance_tokens });
    setUsers((prev) =>
      prev.map((u) => (u.user_id === selected.user_id ? { ...u, balance_tokens: newBalance ?? u.balance_tokens } : u)),
    );
    toast({
      title: sign > 0 ? "Tokens cargados" : "Tokens restados",
      description: `${sign > 0 ? "+" : "-"}${parsed} tokens · nuevo saldo ${newBalance ?? "—"}.`,
    });
    void loadLedger(selected.user_id);
  };

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthRows = ledger.filter((r) => new Date(r.created_at) >= monthStart);
  const loadedThisMonth = monthRows.filter((r) => r.delta_tokens > 0).reduce((a, r) => a + r.delta_tokens, 0);
  const spentThisMonth = monthRows.filter((r) => r.delta_tokens < 0).reduce((a, r) => a - r.delta_tokens, 0);

  return (
    <>
      <SEO title="Panel de tokens — TikShopTok" description="Panel interno de tokens." path="/admin/tokens" noindex />
      <Navbar />
      <main className="min-h-screen px-4 pt-28 pb-16 md:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="bento relative overflow-hidden p-8">
            <div className="neon-blob-pink -right-10 -top-10 opacity-60" />
            <div className="relative">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-secondary">Interno</p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Panel de tokens</h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Carga o corrige tokens a mano y consulta el historial de movimientos.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Saldo del cliente</p>
                  <p className="mt-1 font-display text-2xl font-bold">{selected?.balance_tokens ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Cargados este mes</p>
                  <p className="mt-1 font-display text-2xl font-bold text-emerald-400">+{loadedThisMonth}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Consumidos este mes</p>
                  <p className="mt-1 font-display text-2xl font-bold text-primary">-{spentThisMonth}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="bento p-6">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void loadUsers(search.trim());
                }}
              >
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por correo"
                  aria-label="Buscar cliente por correo"
                />
                <Button type="submit" variant="outline" disabled={loading} aria-label="Buscar">
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </form>

              <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
                {users.map((u) => (
                  <li key={u.user_id}>
                    <button
                      type="button"
                      onClick={() => setSelected(u)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        selected?.user_id === u.user_id
                          ? "border-primary/50 bg-primary/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <p className="truncate text-sm font-medium">{u.email ?? u.user_id}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">{u.plan ?? "sin plan"}</Badge>
                        <span className="inline-flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {u.balance_tokens ?? 0}
                        </span>
                        <span>Renueva: {fmtDate(u.renews_at)}</span>
                      </p>
                    </button>
                  </li>
                ))}
                {!users.length && !loading && (
                  <li className="text-sm text-muted-foreground">Sin resultados.</li>
                )}
              </ul>
            </div>

            <div className="bento p-6">
              <h2 className="font-display text-xl font-bold">
                {selected ? selected.email ?? selected.user_id : "Elige un cliente"}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground" htmlFor="amount">
                    Cantidad
                  </label>
                  <Input
                    id="amount"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground" htmlFor="reason">
                    Motivo
                  </label>
                  <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => void adjust(1)} disabled={!selected || working} className="gap-2">
                  <Plus className="h-4 w-4" /> Cargar tokens
                </Button>
                <Button
                  onClick={() => void adjust(-1)}
                  disabled={!selected || working}
                  variant="outline"
                  className="gap-2"
                >
                  <Minus className="h-4 w-4" /> Restar tokens
                </Button>
              </div>

              <h3 className="mt-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Historial de movimientos
              </h3>
              <div className="mt-3 max-h-96 overflow-y-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Concepto</th>
                      <th className="px-3 py-2 text-right">Tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((row) => (
                      <tr key={row.id} className="border-t border-white/5">
                        <td className="px-3 py-2 text-muted-foreground">{fmtDate(row.created_at)}</td>
                        <td className="px-3 py-2">
                          {row.reason}
                          {row.video_id && <span className="ml-2 text-xs text-muted-foreground">vídeo</span>}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-medium ${
                            row.delta_tokens > 0 ? "text-emerald-400" : "text-primary"
                          }`}
                        >
                          {row.delta_tokens > 0 ? "+" : ""}
                          {row.delta_tokens}
                        </td>
                      </tr>
                    ))}
                    {!ledger.length && (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                          Sin movimientos todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminTokens;
