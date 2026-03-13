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

interface ReauthenticationEmailProps {
  token: string
}

const FEATURED_VIDEO_ID = '7610820653284936982'
const FEATURED_VIDEO_URL = `https://www.tiktok.com/@tikshoptokk/video/${FEATURED_VIDEO_ID}`

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>🔒 Tu código de verificación</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Section style={header}>
          <Text style={brandName}>TikShopTok</Text>
          <Text style={brandTagline}>Tu agencia de TikTok Shop</Text>
        </Section>

        <Section style={content}>
          <Heading style={h1}>Confirma tu identidad 🔒</Heading>
          <Text style={text}>Usa el siguiente código para verificar tu identidad:</Text>

          <Section style={codeContainer}>
            <Text style={codeStyle}>{token}</Text>
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
          <Text style={footerText}>Este código expirará en breve. Si no lo solicitaste, puedes ignorar este email.</Text>
          <Text style={footerBrand}>© TikShopTok — tikshoptok.com</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const wrapper = { maxWidth: '520px', margin: '0 auto' }
const header = { background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)', borderBottom: '3px solid', borderImage: 'linear-gradient(90deg, #e8396b, #26bfbf) 1', padding: '32px 30px 24px', textAlign: 'center' as const }
const brandName = { fontSize: '28px', fontWeight: 'bold' as const, fontFamily: "'Space Grotesk', Arial, sans-serif", color: '#e8396b', margin: '0', letterSpacing: '-0.5px' }
const brandTagline = { fontSize: '12px', color: '#8888aa', margin: '4px 0 0', textTransform: 'uppercase' as const, letterSpacing: '2px' }
const content = { padding: '32px 30px 20px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0f', margin: '0 0 16px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#444466', lineHeight: '1.6', margin: '0 0 16px' }
const codeContainer = { textAlign: 'center' as const, margin: '24px 0', background: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a3e' }
const codeStyle = { fontFamily: "'Space Grotesk', Courier, monospace", fontSize: '32px', fontWeight: 'bold' as const, color: '#e8396b', margin: '0', letterSpacing: '6px' }
const divider = { borderColor: '#eeeef2', margin: '8px 0 24px' }
const videoSection = { textAlign: 'center' as const, margin: '0 0 8px' }
const videoLabel = { fontSize: '11px', fontWeight: 'bold' as const, color: '#e8396b', textTransform: 'uppercase' as const, letterSpacing: '1.5px', margin: '0 0 12px' }
const videoCard = { background: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)', borderRadius: '16px', padding: '24px 20px', border: '1px solid #2a2a3e' }
const videoPlayIcon = { fontSize: '32px', color: '#e8396b', margin: '0 0 8px' }
const videoTitle = { fontSize: '16px', fontWeight: 'bold' as const, color: '#ffffff', margin: '0 0 4px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const videoSubtitle = { fontSize: '13px', color: '#26bfbf', margin: '0' }
const footer = { backgroundColor: '#f8f8fa', padding: '20px 30px', borderTop: '1px solid #eeeef2' }
const footerText = { fontSize: '12px', color: '#999999', margin: '0 0 8px', textAlign: 'center' as const }
const footerBrand = { fontSize: '11px', color: '#cccccc', margin: '0', textAlign: 'center' as const }
