import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
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

    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: notificationEmail,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: `Nuevo contacto de ${name}`,
        html,
        text,
        purpose: 'transactional',
        label: 'contact_notification',
        queued_at: new Date().toISOString(),
      },
    })

    if (enqueueError) {
      console.error('Failed to enqueue contact email', { error: enqueueError })
      await supabase.from('email_send_log').update({ status: 'failed', error_message: 'Failed to enqueue' }).eq('message_id', messageId)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Contact notification enqueued', { to: notificationEmail, from: email })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
