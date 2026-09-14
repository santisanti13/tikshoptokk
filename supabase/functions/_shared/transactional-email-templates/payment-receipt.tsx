import * as React from 'npm:react@18.3.1'
import { PaymentNotificationEmail } from '../email-templates/payment-notification.tsx'
import type { TemplateEntry } from './registry.ts'

const CustomerEmail = (props: Record<string, any>) =>
  React.createElement(PaymentNotificationEmail, { ...props, audience: 'customer' })

export const template = {
  component: CustomerEmail,
  subject: (data: Record<string, any>) =>
    `${data?.headline ?? 'Confirmación de pago'} — ${data?.planName ?? 'tu plan'}`,
  displayName: 'Recibo para el cliente',
  previewData: {
    headline: 'Pago confirmado',
    planName: 'Plan Pro',
    amountLabel: '149,00 EUR',
    customerEmail: 'cliente@ejemplo.com',
    detail: 'Tu suscripción mensual está activa.',
  },
} satisfies TemplateEntry
