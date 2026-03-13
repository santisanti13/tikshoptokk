/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface ContactNotificationEmailProps {
  name: string
  email: string
  company?: string
  message: string
}

const FEATURED_VIDEO_ID = '7610820653284936982'
const FEATURED_VIDEO_URL = `https://www.tiktok.com/@tikshoptok/video/${FEATURED_VIDEO_ID}`

export const ContactNotificationEmail = ({
  name,
  email,
  company,
  message,
}: ContactNotificationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>📩 Nuevo mensaje de contacto de {name}</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Section style={header}>
          <Text style={brandName}>TikShopTok</Text>
          <Text style={brandTagline}>Tu agencia de TikTok Shop</Text>
        </Section>

        <Section style={content}>
          <Heading style={h1}>Nuevo mensaje de contacto 📩</Heading>

          <Section style={fieldGroup}>
            <Text style={label}>NOMBRE</Text>
            <Text style={value}>{name}</Text>
          </Section>

          <Section style={fieldGroup}>
            <Text style={label}>EMAIL</Text>
            <Text style={value}>
              <Link href={`mailto:${email}`} style={linkCyan}>{email}</Link>
            </Text>
          </Section>

          {company && (
            <Section style={fieldGroup}>
              <Text style={label}>EMPRESA</Text>
              <Text style={value}>{company}</Text>
            </Section>
          )}

          <Hr style={divider} />

          <Section style={messageBox}>
            <Text style={label}>MENSAJE</Text>
            <Text style={messageText}>{message}</Text>
          </Section>

          <Hr style={divider} />

          <Section style={videoSection}>
            <Text style={videoLabel}>🔥 NUESTRO VÍDEO MÁS VIRAL</Text>
            <Link href={FEATURED_VIDEO_URL} style={{ textDecoration: 'none' }}>
              <Section style={videoCard}>
                <Text style={videoPlayIcon}>▶</Text>
                <Text style={videoTitle}>+500K visualizaciones</Text>
                <Text style={videoSubtitle}>Ver en TikTok →</Text>
              </Section>
            </Link>
          </Section>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Este email fue enviado desde el formulario de contacto de tikshoptokk.
          </Text>
          <Text style={footerBrand}>© TikShopTok — tikshoptok.com</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ContactNotificationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const wrapper = { maxWidth: '520px', margin: '0 auto' }
const header = { background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)', borderBottom: '3px solid', borderImage: 'linear-gradient(90deg, #e8396b, #26bfbf) 1', padding: '32px 30px 24px', textAlign: 'center' as const }
const brandName = { fontSize: '28px', fontWeight: 'bold' as const, fontFamily: "'Space Grotesk', Arial, sans-serif", color: '#e8396b', margin: '0', letterSpacing: '-0.5px' }
const brandTagline = { fontSize: '12px', color: '#8888aa', margin: '4px 0 0', textTransform: 'uppercase' as const, letterSpacing: '2px' }
const content = { padding: '32px 30px 20px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0f', margin: '0 0 20px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const fieldGroup = { margin: '0 0 16px' }
const label = { fontSize: '11px', fontWeight: 'bold' as const, color: '#e8396b', textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 4px' }
const value = { fontSize: '15px', color: '#0a0a0f', lineHeight: '1.5', margin: '0' }
const linkCyan = { color: '#26bfbf', textDecoration: 'underline' }
const divider = { borderColor: '#eeeef2', margin: '16px 0' }
const messageBox = { background: '#f8f8fa', borderRadius: '12px', padding: '16px 20px', border: '1px solid #eeeef2' }
const messageText = { fontSize: '15px', color: '#444466', lineHeight: '1.6', margin: '0' }
const videoSection = { textAlign: 'center' as const, margin: '8px 0 0' }
const videoLabel = { fontSize: '11px', fontWeight: 'bold' as const, color: '#e8396b', textTransform: 'uppercase' as const, letterSpacing: '1.5px', margin: '0 0 12px' }
const videoCard = { background: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)', borderRadius: '16px', padding: '24px 20px', border: '1px solid #2a2a3e' }
const videoPlayIcon = { fontSize: '32px', color: '#e8396b', margin: '0 0 8px' }
const videoTitle = { fontSize: '16px', fontWeight: 'bold' as const, color: '#ffffff', margin: '0 0 4px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const videoSubtitle = { fontSize: '13px', color: '#26bfbf', margin: '0' }
const footer = { backgroundColor: '#f8f8fa', padding: '20px 30px', borderTop: '1px solid #eeeef2' }
const footerText = { fontSize: '12px', color: '#999999', margin: '0 0 8px', textAlign: 'center' as const }
const footerBrand = { fontSize: '11px', color: '#cccccc', margin: '0', textAlign: 'center' as const }
