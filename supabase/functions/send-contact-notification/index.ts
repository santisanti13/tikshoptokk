import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3.23.8'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'
import { logEmailSend } from '../_shared/emailLog.ts'

const BodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(4000),
})

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// Límite básico por IP para un formulario público.
const RATE_LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > RATE_LIMIT
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(ip)) {
    return json({ error: 'Too many requests' }, 429)
  }

  const notificationEmail = Deno.env.get('NOTIFICATION_EMAIL')
  if (!notificationEmail) {
    console.error('NOTIFICATION_EMAIL not configured')
    return json({ error: 'Server configuration error' }, 500)
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const parsed = BodySchema.safeParse((raw as { data?: unknown })?.data ?? raw)
  if (!parsed.success) {
    return json({ error: parsed.error.flatten().fieldErrors }, 400)
  }

  const { name, email, company, message } = parsed.data
  const idempotencyKey = `contact-notification-${crypto.randomUUID()}`

  try {
    const result = await sendTemplateEmail('contact-notification', notificationEmail, {
      templateData: { name, email, company, message },
      idempotencyKey,
      replyTo: email,
    })

    await logEmailSend({
      templateName: 'contact-notification',
      recipientEmail: notificationEmail,
      status: result.sent ? 'sent' : 'suppressed',
      errorMessage: result.sent ? undefined : 'Recipient suppressed',
    })

    return json({ success: true, sent: result.sent })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('contact notification send failed', errorMsg)
    await logEmailSend({
      templateName: 'contact-notification',
      recipientEmail: notificationEmail,
      status: 'failed',
      errorMessage: errorMsg,
    })
    return json({ error: 'Failed to send email' }, 500)
  }
})
