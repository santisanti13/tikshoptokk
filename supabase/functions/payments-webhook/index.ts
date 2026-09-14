import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, verifyWebhook } from "../_shared/stripe.ts";
import { grantForPrice } from "../_shared/ugcTokenPacks.ts";
import { planForPrice, formatEur } from "../_shared/planCatalog.ts";

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

/** Aviso por correo de cualquier movimiento de pago (y recibo opcional al cliente). */
async function notify(payload: {
  headline: string;
  planName: string;
  amountLabel?: string;
  customerEmail?: string;
  detail?: string;
  notifyCustomer?: boolean;
}) {
  try {
    const { error } = await db().functions.invoke("send-transactional-email", {
      body: { type: "payment_notification", data: payload },
    });
    if (error) console.error("notify failed", error.message);
  } catch (e) {
    console.error("notify threw", e);
  }
}

function priceIdOf(item: any): string | undefined {
  return item?.price?.lookup_key ?? item?.price?.metadata?.lovable_external_id ?? undefined;
}

function labelForPrice(priceId?: string | null): string {
  return planForPrice(priceId ?? null)?.name ?? String(priceId ?? "plan desconocido");
}

function amountLabel(cents?: number | null, currency = "eur"): string | undefined {
  if (typeof cents !== "number") return undefined;
  return `${(cents / 100).toLocaleString("es-ES", { minimumFractionDigits: 2 })} ${currency.toUpperCase()}`;
}

/** Busca el usuario asociado al pago: metadata, cliente de Stripe o histórico guardado. */
async function resolveUserId(
  env: StripeEnv,
  opts: { metadataUserId?: string; customerId?: string | null; subscriptionId?: string | null },
): Promise<{ userId?: string; email?: string }> {
  if (opts.metadataUserId) {
    return { userId: opts.metadataUserId, email: await emailForUser(opts.metadataUserId) };
  }

  if (opts.customerId) {
    const { data } = await db()
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", opts.customerId)
      .limit(1)
      .maybeSingle();
    const fromDb = (data as { user_id?: string } | null)?.user_id;
    if (fromDb) return { userId: fromDb, email: await emailForUser(fromDb) };

    try {
      const stripe = createStripeClient(env);
      const customer = await stripe.customers.retrieve(opts.customerId);
      const metaUser = (customer as any)?.metadata?.userId;
      if (metaUser) return { userId: metaUser, email: await emailForUser(metaUser) };
      const email = (customer as any)?.email as string | undefined;
      if (email) return { email };
    } catch (e) {
      console.error("customer lookup failed", e);
    }
  }

  return {};
}

async function emailForUser(userId: string): Promise<string | undefined> {
  const { data } = await db().auth.admin.getUserById(userId);
  return data?.user?.email ?? undefined;
}

async function upsertSubscription(subscription: any, env: StripeEnv, notifyKind?: "created" | "updated" | "deleted") {
  const item = subscription.items?.data?.[0];
  const priceId = priceIdOf(item) ?? item?.price?.id;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  const { userId, email } = await resolveUserId(env, {
    metadataUserId: subscription.metadata?.userId,
    customerId,
    subscriptionId: subscription.id,
  });

  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  const periodStillOpen = Boolean(periodEnd) && periodEnd * 1000 > Date.now();
  const keepsAccess =
    subscription.status === "active" ||
    subscription.status === "trialing" ||
    subscription.status === "past_due" ||
    (subscription.status === "canceled" && periodStillOpen);

  if (!userId) {
    console.error("subscription without resolvable user", subscription.id);
  } else {
    await db().from("subscriptions").upsert(
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
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
      // Al cancelar se mantiene el acceso hasta el final del periodo ya pagado.
      await db().rpc("ugc_set_plan", {
        _user_id: userId,
        _plan: keepsAccess ? grant.plan : "cancelado",
        _monthly_tokens: grant.tokens,
        _renews_at: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      });
    }
  }

  if (notifyKind === "deleted") {
    await notify({
      headline: "Suscripción cancelada",
      planName: labelForPrice(priceId),
      customerEmail: email,
      notifyCustomer: true,
      detail: periodStillOpen
        ? `El cliente conserva el acceso hasta ${new Date(periodEnd * 1000).toLocaleDateString("es-ES")}.`
        : "El acceso queda cerrado.",
    });
  } else if (notifyKind === "updated" && subscription.cancel_at_period_end) {
    await notify({
      headline: "Cancelación programada",
      planName: labelForPrice(priceId),
      customerEmail: email,
      notifyCustomer: true,
      detail: periodEnd
        ? `Mantiene acceso hasta ${new Date(periodEnd * 1000).toLocaleDateString("es-ES")}.`
        : undefined,
    });
  }
}

/** Reparte los tokens de una factura pagada (primera cuota y renovaciones). */
async function handleInvoicePaid(invoice: any, env: StripeEnv) {
  const line = invoice.lines?.data?.[0];
  const priceId = priceIdOf(line);
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  const { userId, email } = await resolveUserId(env, {
    metadataUserId: invoice.subscription_details?.metadata?.userId ?? invoice.metadata?.userId,
    customerId,
    subscriptionId: typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id,
  });

  if (!(await claimEvent(`invoice:${invoice.id}`))) return;

  const grant = grantForPrice(priceId);
  if (grant && userId) {
    await grantTokens(userId, grant.tokens, `plan_${priceId}`);
  }

  await notify({
    headline: invoice.billing_reason === "subscription_cycle" ? "Renovación cobrada" : "Nueva venta",
    planName: labelForPrice(priceId),
    amountLabel: amountLabel(invoice.amount_paid, invoice.currency),
    customerEmail: email ?? invoice.customer_email ?? undefined,
    detail: grant ? `Se han abonado ${grant.tokens} tokens al cliente.` : "Servicio de agencia: activación manual.",
    notifyCustomer: true,
  });
}

async function handleSessionCompleted(session: any, env: StripeEnv) {
  if (session.payment_status === "unpaid") return;
  if (session.mode !== "payment") return; // las suscripciones se cargan vía factura
  const priceId = session.metadata?.priceId;
  const userId = session.metadata?.userId;
  const grant = grantForPrice(priceId);
  if (!(await claimEvent(`session:${session.id}`))) return;

  if (grant && userId) {
    await grantTokens(userId, grant.tokens, `recarga_${priceId}`);
  }

  const plan = planForPrice(priceId);
  await notify({
    headline: "Nueva venta",
    planName: labelForPrice(priceId),
    amountLabel: amountLabel(session.amount_total, session.currency ?? "eur") ?? (plan ? formatEur(plan.priceEur) : undefined),
    customerEmail: session.customer_details?.email ?? undefined,
    detail: grant ? `Se han abonado ${grant.tokens} tokens al cliente.` : "Servicio de agencia: activación manual.",
    notifyCustomer: true,
  });
}

async function handlePaymentFailed(invoice: any, env: StripeEnv) {
  const line = invoice.lines?.data?.[0];
  const priceId = priceIdOf(line);
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  const { email } = await resolveUserId(env, { customerId });
  if (!(await claimEvent(`invoice_failed:${invoice.id}:${invoice.attempt_count ?? 0}`))) return;
  await notify({
    headline: "Pago fallido",
    planName: labelForPrice(priceId),
    amountLabel: amountLabel(invoice.amount_due, invoice.currency),
    customerEmail: email ?? invoice.customer_email ?? undefined,
    detail: "Stripe reintentará el cobro. El cliente puede actualizar su tarjeta desde Mi cuenta.",
    notifyCustomer: true,
  });
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
