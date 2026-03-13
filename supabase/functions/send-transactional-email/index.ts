import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendLovableEmail } from 'npm:@lovable.dev/email-js'
import { ContactNotificationEmail } from '../_shared/email-templates/contact-notification.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_NAME = 'tikshoptokk'
const SENDER_DOMAIN = 'notify.tikshoptok.com'
const FROM_DOMAIN = 'tikshoptok.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()

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
