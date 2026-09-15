import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Indica si la sesión actual tiene rol de administrador. */
export function useIsAdmin() {
  const [state, setState] = useState<"loading" | "yes" | "no">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        if (!cancelled) setState("no");
        return;
      }
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!cancelled) setState(!error && data === true ? "yes" : "no");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { loading: state === "loading", isAdmin: state === "yes" };
}
