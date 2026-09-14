import { ContactNotificationEmail } from '../email-templates/contact-notification.tsx'
import type { TemplateEntry } from './registry.ts'

export const template = {
  component: ContactNotificationEmail,
  subject: (data: Record<string, any>) => `Nuevo contacto de ${data?.name ?? 'la web'}`,
  displayName: 'Aviso de nuevo contacto',
  previewData: {
    name: 'Laura Gómez',
    email: 'laura@ejemplo.com',
    company: 'Marca de moda',
    message: 'Queremos empezar a vender en TikTok Shop este trimestre.',
  },
} satisfies TemplateEntry
