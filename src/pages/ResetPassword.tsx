import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetPassword = () => {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    setDone(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-24">
      <Helmet>
        <title>Nueva contraseña — TikShopTok</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-card/60 p-7 backdrop-blur-xl">
        <h1 className="font-display text-2xl font-bold tracking-tight">Crea una contraseña nueva</h1>

        {done ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">Contraseña actualizada. Ya puedes usarla para entrar.</p>
            <Button asChild className="w-full rounded-full">
              <a href="/mi-cuenta">Ir a mi cuenta</a>
            </Button>
          </div>
        ) : !ready ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Abre esta página desde el enlace del correo de recuperación para poder cambiar la contraseña.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña nueva</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full rounded-full">
              {busy ? "Guardando…" : "Guardar contraseña"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ResetPassword;
