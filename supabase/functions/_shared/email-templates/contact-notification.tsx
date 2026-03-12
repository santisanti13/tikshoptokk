/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface ContactNotificationEmailProps {
  name: string
  email: string
  company?: string
  message: string
}

export const ContactNotificationEmail = ({
  name,
  email,
  company,
  message,
}: ContactNotificationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nuevo mensaje de contacto de {name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nuevo mensaje de contacto</Heading>
        <Text style={label}>Nombre</Text>
        <Text style={value}>{name}</Text>
        <Text style={label}>Email</Text>
        <Text style={value}>{email}</Text>
        {company && (
          <>
            <Text style={label}>Empresa</Text>
            <Text style={value}>{company}</Text>
          </>
        )}
        <Hr style={hr} />
        <Text style={label}>Mensaje</Text>
        <Text style={value}>{message}</Text>
        <Text style={footer}>
          Este email fue enviado desde el formulario de contacto de tikshoptokk.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ContactNotificationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1a1a2e',
  margin: '0 0 24px',
  fontFamily: "'Space Grotesk', Arial, sans-serif",
}
const label = {
  fontSize: '12px',
  fontWeight: 'bold' as const,
  color: '#999999',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 4px',
}
const value = {
  fontSize: '14px',
  color: '#1a1a2e',
  lineHeight: '1.5',
  margin: '0 0 16px',
}
const hr = { borderColor: '#e5e5e5', margin: '16px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
