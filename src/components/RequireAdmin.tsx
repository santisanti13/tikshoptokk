import { useIsAdmin } from "@/hooks/useIsAdmin";

/** Envuelve rutas de administración: si no eres admin, muestra aviso claro. */
const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { loading, isAdmin } = useIsAdmin();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Comprobando permisos…</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="bento max-w-md p-8 text-center">
          <h1 className="font-display text-2xl font-bold">Acceso no autorizado</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Esta zona es solo para el equipo de TikShopTok.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;
