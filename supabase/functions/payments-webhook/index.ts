import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, verifyWebhook } from "../_shared/stripe.ts";
import { grantForPrice } from "../_shared/ugcTokenPacks.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function db() {
  if (!_supabase) {
    _supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  }
  return _supabase;
}

/** Devuelve false si el evento ya se procesó antes. */
async function claimEvent(key: string): Promise<boolean> {
  const { error } = await db().from("payment_events").insert({ event_key: key });
  if (error) {
    console.log("event already processed", key, error.message);
    return false;
  }
  return true;
}

async function grantTokens(userId: string, tokens: number, reason: string) {
  const { error } = await db().rpc("ugc_grant_tokens", {
    _user_id: userId,
    _tokens: tokens,
    _reason: reason,
    _video_id: null,
  });
  if (error) throw new Error(`grant failed: ${error.message}`);
}

function priceIdOf(item: any): string | undefined {
  return item?.price?.lookup_key ?? item?.price?.metadata?.lovable_external_id ?? undefined;
}

async function upsertSubscription(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;
  const item = subscription.items?.data?.[0];
  const priceId = priceIdOf(item) ?? item?.price?.id;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await db().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
      product_id: String(item?.price?.product ?? ""),
      price_id: String(priceId ?? ""),
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  const grant = grantForPrice(priceIdOf(item));
  if (grant?.plan) {
    // Al cancelar se mantiene el acceso hasta el final del periodo ya pagado:
    // el plan sigue activo mientras current_period_end esté en el futuro.
    const periodStillOpen = Boolean(periodEnd) && periodEnd * 1000 > Date.now();
    const keepsAccess =
      subscription.status === "active" ||
      subscription.status === "trialing" ||
      subscription.status === "past_due" ||
      (subscription.status === "canceled" && periodStillOpen);

    await db().rpc("ugc_set_plan", {
      _user_id: userId,
      _plan: keepsAccess ? grant.plan : "cancelado",
      _monthly_tokens: grant.tokens,
      _renews_at: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    });
  }
}

/** Reparte los tokens de una factura pagada (primera cuota y renovaciones). */
async function handleInvoicePaid(invoice: any, env: StripeEnv) {
  const line = invoice.lines?.data?.[0];
  const priceId = priceIdOf(line);
  const grant = grantForPrice(priceId);
  if (!grant) return;

  let userId: string | undefined = invoice.subscription_details?.metadata?.userId ?? invoice.metadata?.userId;
  if (!userId && invoice.subscription) {
    const stripe = createStripeClient(env);
    const subscription = await stripe.subscriptions.retrieve(
      typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id,
    );
    userId = (subscription.metadata as Record<string, string> | undefined)?.userId;
  }
  if (!userId) return;

  if (!(await claimEvent(`invoice:${invoice.id}`))) return;
  await grantTokens(userId, grant.tokens, `plan_${priceId}`);
}

async function handleSessionCompleted(session: any, env: StripeEnv) {
  if (session.payment_status === "unpaid") return;
  if (session.mode !== "payment") return; // las suscripciones se cargan vía factura
  const priceId = session.metadata?.priceId;
  const grant = grantForPrice(priceId);
  const userId = session.metadata?.userId;
  if (!grant || !userId) return;
  if (!(await claimEvent(`session:${session.id}`))) return;
  await grantTokens(userId, grant.tokens, `recarga_${priceId}`);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("invalid env query param", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  try {
    const event = await verifyWebhook(req, env);
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await upsertSubscription(event.data.object, env);
        break;
      case "customer.subscription.deleted":
        await upsertSubscription({ ...event.data.object, status: "canceled" }, env);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object, env);
        break;
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleSessionCompleted(event.data.object, env);
        break;
      default:
        console.log("unhandled event", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("payments-webhook error", e);
    return new Response("Webhook error", { status: 400 });
  }
});
