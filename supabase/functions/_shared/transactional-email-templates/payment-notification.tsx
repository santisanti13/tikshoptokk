import * as React from 'npm:react@18.3.1'
import { PaymentNotificationEmail } from '../email-templates/payment-notification.tsx'
import type { TemplateEntry } from './registry.ts'

const OwnerEmail = (props: Record<string, any>) =>
  React.createElement(PaymentNotificationEmail, { ...props, audience: 'owner' })

export const template = {
  component: OwnerEmail,
  subject: (data: Record<string, any>) =>
    `${data?.headline ?? 'Movimiento de pago'}: ${data?.planName ?? 'plan'}`,
  displayName: 'Aviso de pago (interno)',
  previewData: {
    headline: 'Nueva venta',
    planName: 'Plan Pro',
    amountLabel: '149,00 EUR',
    customerEmail: 'cliente@ejemplo.com',
    detail: 'Suscripción mensual activada.',
  },
} satisfies TemplateEntry
