/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

const FEATURED_VIDEO_ID = '7610820653284936982'
const FEATURED_VIDEO_URL = `https://www.tiktok.com/@tikshoptok/video/${FEATURED_VIDEO_ID}`

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
    </Head>
    <Preview>🎉 Confirma tu email en {siteName} y empieza a vender en TikTok Shop</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        {/* Header con gradiente */}
        <Section style={header}>
          <Text style={brandName}>TikShopTok</Text>
          <Text style={brandTagline}>Tu agencia de TikTok Shop</Text>
        </Section>

        {/* Contenido */}
        <Section style={content}>
          <Heading style={h1}>¡Bienvenido al equipo! 🚀</Heading>
          <Text style={text}>
            Gracias por registrarte en{' '}
            <Link href={siteUrl} style={linkPrimary}>
              <strong>{siteName}</strong>
            </Link>
            . Estás a un paso de desbloquear todo el potencial de TikTok Shop.
          </Text>
          <Text style={text}>
            Confirma tu dirección de email (
            <Link href={`mailto:${recipient}`} style={linkCyan}>
              {recipient}
            </Link>
            ) para empezar:
          </Text>

          <Section style={buttonContainer}>
            <Button style={buttonPrimary} href={confirmationUrl}>
              ✓ Verificar mi Email
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Video destacado */}
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

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Si no creaste una cuenta, puedes ignorar este email.
          </Text>
          <Text style={footerBrand}>© TikShopTok — tikshoptok.com</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

// ─── Styles ────────────────────────────────────────────────
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const wrapper = { maxWidth: '520px', margin: '0 auto' }

const header = {
  background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)',
  borderBottom: '3px solid',
  borderImage: 'linear-gradient(90deg, #e8396b, #26bfbf) 1',
  padding: '32px 30px 24px',
  textAlign: 'center' as const,
}
const brandName = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  background: 'linear-gradient(90deg, #e8396b, #26bfbf)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: '#e8396b',
  margin: '0',
  letterSpacing: '-0.5px',
}
const brandTagline = {
  fontSize: '12px',
  color: '#8888aa',
  margin: '4px 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
}

const content = { padding: '32px 30px 20px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0a0a0f',
  margin: '0 0 16px',
  fontFamily: "'Space Grotesk', Arial, sans-serif",
}
const text = {
  fontSize: '15px',
  color: '#444466',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const linkPrimary = { color: '#e8396b', textDecoration: 'underline' }
const linkCyan = { color: '#26bfbf', textDecoration: 'underline' }

const buttonContainer = { textAlign: 'center' as const, margin: '28px 0' }
const buttonPrimary = {
  background: 'linear-gradient(135deg, #e8396b, #d42d5f)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 32px',
  textDecoration: 'none',
  display: 'inline-block' as const,
}

const divider = { borderColor: '#eeeef2', margin: '8px 0 24px' }

const videoSection = { textAlign: 'center' as const, margin: '0 0 8px' }
const videoLabel = {
  fontSize: '11px',
  fontWeight: 'bold' as const,
  color: '#e8396b',
  textTransform: 'uppercase' as const,
  letterSpacing: '1.5px',
  margin: '0 0 12px',
}
const videoCard = {
  background: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)',
  borderRadius: '16px',
  padding: '24px 20px',
  border: '1px solid #2a2a3e',
}
const videoPlayIcon = {
  fontSize: '32px',
  color: '#e8396b',
  margin: '0 0 8px',
}
const videoTitle = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  margin: '0 0 4px',
  fontFamily: "'Space Grotesk', Arial, sans-serif",
}
const videoSubtitle = {
  fontSize: '13px',
  color: '#26bfbf',
  margin: '0',
}

const footer = {
  backgroundColor: '#f8f8fa',
  padding: '20px 30px',
  borderTop: '1px solid #eeeef2',
}
const footerText = { fontSize: '12px', color: '#999999', margin: '0 0 8px', textAlign: 'center' as const }
const footerBrand = { fontSize: '11px', color: '#cccccc', margin: '0', textAlign: 'center' as const }
