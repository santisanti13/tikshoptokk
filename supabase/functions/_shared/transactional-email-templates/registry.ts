import type { ComponentType } from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome.tsx'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as contactNotificationTemplate } from './contact-notification.tsx'
import { template as paymentNotificationTemplate } from './payment-notification.tsx'
import { template as paymentReceiptTemplate } from './payment-receipt.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'contact-notification': contactNotificationTemplate,
  'payment-notification': paymentNotificationTemplate,
  'payment-receipt': paymentReceiptTemplate,
}
