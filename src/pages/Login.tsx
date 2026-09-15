import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function safeNext(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

const Login = () => {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<"signin" | "signup" | "recover">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) window.location.href = next;
    });
    return () => {
      active = false;
    };
  }, [next]);

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    window.location.href = next;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    if (mode === "recover") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      if (error) return setError(error.message);
      setNotice("Te hemos enviado un correo con el enlace para crear una contraseña nueva.");
      return;
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      window.location.href = next;
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}${next}` },
    });
    setBusy(false);
    if (error) return setError(error.message);
    if (data.session) {
      window.location.href = next;
      return;
    }
    setNotice("Te hemos enviado un correo para confirmar tu cuenta. Ábrelo para continuar.");
  }


  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-24">
      <Helmet>
        <title>Acceso — TikShopTok</title>
        <meta name="description" content="Accede a tu cuenta de TikShopTok." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-card/60 p-7 backdrop-blur-xl">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Inicia sesión" : mode === "signup" ? "Crea tu cuenta" : "Recuperar contraseña"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "recover"
            ? "Escribe tu email y te enviamos un enlace para crear una contraseña nueva."
            : "Accede para gestionar tu plan, tus tokens y el estudio UGC."}
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-6 w-full rounded-full"
          disabled={busy}
          onClick={signInWithGoogle}
        >
          Continuar con Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-white/10" />o con tu email<span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== "recover" && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-secondary">{notice}</p>}
          <Button type="submit" disabled={busy} className="w-full rounded-full">
            {busy
              ? "Un momento…"
              : mode === "signin"
                ? "Entrar"
                : mode === "signup"
                  ? "Registrarme"
                  : "Enviarme el enlace"}
          </Button>
        </form>

        <div className="mt-5 flex flex-col gap-2 text-sm">
          <button
            type="button"
            className="text-left text-muted-foreground underline hover:text-foreground"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
          >
            {mode === "signin" ? "No tengo cuenta todavía" : "Ya tengo cuenta"}
          </button>
          {mode !== "recover" && (
            <button
              type="button"
              className="text-left text-muted-foreground underline hover:text-foreground"
              onClick={() => {
                setMode("recover");
                setError(null);
                setNotice(null);
              }}
            >
              He olvidado mi contraseña
            </button>
          )}
        </div>

      </div>
    </main>
  );
};

export default Login;
