import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

let _db: ReturnType<typeof createClient> | null = null;
function db() {
  if (!_db) {
    _db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  }
  return _db;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const environment: StripeEnv = body.environment === "live" ? "live" : "sandbox";
    const returnUrl = typeof body.returnUrl === "string" ? body.returnUrl : undefined;

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: userData, error: authError } = await db().auth.getUser(token ?? "");
    if (authError || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const { data: sub } = await db()
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .eq("environment", environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const customerId = (sub as { stripe_customer_id?: string } | null)?.stripe_customer_id;
    if (!customerId) return json({ error: "Todavía no tienes ninguna suscripción activa." }, 404);

    const stripe = createStripeClient(environment);
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      ...(returnUrl && { return_url: returnUrl }),
    });

    return json({ url: portal.url });
  } catch (e) {
    console.error("create-portal-session error", e);
    return json({ error: e instanceof Error ? e.message : "Error inesperado" }, 500);
  }
});
