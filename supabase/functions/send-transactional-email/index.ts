import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendLovableEmail } from 'npm:@lovable.dev/email-js'
import { ContactNotificationEmail } from '../_shared/email-templates/contact-notification.tsx'
import { PaymentNotificationEmail } from '../_shared/email-templates/payment-notification.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_NAME = 'tikshoptok'
const SENDER_DOMAIN = 'notify.tikshoptok.com'
const FROM_DOMAIN = 'tikshoptok.com'

function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
}

/** Envía un correo transaccional dejando rastro en email_send_log. */
async function deliver(opts: {
  to: string
  subject: string
  html: string
  text: string
  label: string
}) {
  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!apiKey) throw new Error('LOVABLE_API_KEY not configured')

  const supabase = adminClient()
  const messageId = crypto.randomUUID()

  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: opts.label,
    recipient_email: opts.to,
    status: 'pending',
  })

  const unsubscribeToken = crypto.randomUUID()
  await supabase.from('email_unsubscribe_tokens').insert({
    email: opts.to,
    token: unsubscribeToken,
  })

  try {
    await sendLovableEmail(
      {
        to: opts.to,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        purpose: 'transactional',
        label: opts.label,
        idempotency_key: messageId,
        unsubscribe_token: unsubscribeToken,
      },
      { apiKey },
    )
    await supabase.from('email_send_log').update({ status: 'sent' }).eq('message_id', messageId)
  } catch (sendError) {
    const errorMsg = sendError instanceof Error ? sendError.message : String(sendError)
    await supabase
      .from('email_send_log')
      .update({ status: 'failed', error_message: errorMsg.slice(0, 1000) })
      .eq('message_id', messageId)
    throw sendError
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()

    if (type === 'payment_notification') {
      const notificationEmail = Deno.env.get('NOTIFICATION_EMAIL')
      const { headline, planName, amountLabel, customerEmail, detail, notifyCustomer } = data ?? {}
      if (!headline || !planName) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: headline, planName' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const render = async (audience: 'owner' | 'customer') => {
        const element = React.createElement(PaymentNotificationEmail, {
          headline,
          planName,
          amountLabel,
          customerEmail,
          detail,
          audience,
        })
        return {
          html: await renderAsync(element),
          text: await renderAsync(element, { plainText: true }),
        }
      }

      if (notificationEmail) {
        const { html, text } = await render('owner')
        await deliver({
          to: notificationEmail,
          subject: `${headline}: ${planName}`,
          html,
          text,
          label: 'payment_notification',
        })
      }

      if (notifyCustomer && customerEmail) {
        const { html, text } = await render('customer')
        await deliver({
          to: customerEmail,
          subject: `${headline} — ${planName}`,
          html,
          text,
          label: 'payment_receipt',
        }).catch((e) => console.error('receipt failed', e))
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (type !== 'contact_notification') {
      return new Response(
        JSON.stringify({ error: `Unknown email type: ${type}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }


    const { name, email, company, message } = data
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const notificationEmail = Deno.env.get('NOTIFICATION_EMAIL')
    if (!notificationEmail) {
      console.error('NOTIFICATION_EMAIL not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const html = await renderAsync(
      React.createElement(ContactNotificationEmail, { name, email, company, message })
    )
    const text = await renderAsync(
      React.createElement(ContactNotificationEmail, { name, email, company, message }),
      { plainText: true }
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const messageId = crypto.randomUUID()

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'contact_notification',
      recipient_email: notificationEmail,
      status: 'pending',
    })

    // Generate unsubscribe token for transactional email compliance
    const unsubscribeToken = crypto.randomUUID()
    await supabase.from('email_unsubscribe_tokens').insert({
      email: notificationEmail,
      token: unsubscribeToken,
    })

    try {
      await sendLovableEmail(
        {
          to: notificationEmail,
          from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
          sender_domain: SENDER_DOMAIN,
          subject: `Nuevo contacto de ${name}`,
          html,
          text,
          purpose: 'transactional',
          label: 'contact_notification',
          idempotency_key: messageId,
          unsubscribe_token: unsubscribeToken,
        },
        { apiKey }
      )

      await supabase.from('email_send_log')
        .update({ status: 'sent' })
        .eq('message_id', messageId)

      console.log('Contact notification sent directly', { to: notificationEmail, from: email })

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (sendError) {
      const errorMsg = sendError instanceof Error ? sendError.message : String(sendError)
      console.error('Direct email send failed', { error: errorMsg })

      await supabase.from('email_send_log')
        .update({ status: 'failed', error_message: errorMsg.slice(0, 1000) })
        .eq('message_id', messageId)

      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
