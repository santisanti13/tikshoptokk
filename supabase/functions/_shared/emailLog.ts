import { createClient } from 'npm:@supabase/supabase-js@2'

type EmailLogStatus = 'sent' | 'suppressed' | 'failed'

function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
}

/**
 * Deja rastro del envío en email_send_log. Nunca decide el resultado del envío:
 * si el registro falla solo se anota en consola.
 */
export async function logEmailSend(opts: {
  templateName: string
  recipientEmail: string
  status: EmailLogStatus
  errorMessage?: string
  messageId?: string | null
}) {
  const { error } = await admin().from('email_send_log').insert({
    message_id: opts.messageId ?? null,
    template_name: opts.templateName,
    recipient_email: opts.recipientEmail,
    status: opts.status,
    error_message: opts.errorMessage ? opts.errorMessage.slice(0, 1000) : null,
  })
  if (error) {
    console.error('email_send_log insert failed', { code: error.code, message: error.message })
  }
}
