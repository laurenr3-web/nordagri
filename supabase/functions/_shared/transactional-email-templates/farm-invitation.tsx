import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "NordAgri"

interface FarmInvitationProps {
  farmName?: string
  role?: string
  invitationId?: string
  inviterName?: string
}

const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'admin': return 'Administrateur'
    case 'editor': return 'Éditeur'
    case 'viewer': return 'Lecteur'
    default: return 'Membre'
  }
}

const FarmInvitationEmail = ({ farmName, role, invitationId, inviterName }: FarmInvitationProps) => {
  const acceptUrl = `https://nordagri.lovable.app/accept-invitation?id=${invitationId || 'preview'}`

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Vous êtes invité à rejoindre {farmName || 'une ferme'} sur {SITE_NAME}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logo}>{SITE_NAME}</Heading>
          </Section>

          <Heading style={h1}>
            Invitation à rejoindre une ferme
          </Heading>

          <Text style={text}>
            {inviterName
              ? `${inviterName} vous invite à rejoindre la ferme « ${farmName || 'une ferme'} » sur ${SITE_NAME}.`
              : `Vous avez été invité à rejoindre la ferme « ${farmName || 'une ferme'} » sur ${SITE_NAME}.`
            }
          </Text>

          <Text style={text}>
            Votre rôle : <strong>{getRoleLabel(role)}</strong>
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={acceptUrl}>
              Accepter l'invitation
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            Cette invitation expire dans 7 jours. Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
          </Text>

          <Text style={footerText}>
            — L'équipe {SITE_NAME}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: FarmInvitationEmail,
  subject: (data: Record<string, any>) =>
    `Invitation à rejoindre ${data.farmName || 'une ferme'} sur NordAgri`,
  displayName: 'Invitation à une ferme',
  previewData: {
    farmName: 'Ferme Delisle',
    role: 'editor',
    invitationId: 'preview-id',
    inviterName: 'Laurent Delisle',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '520px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logo = { fontSize: '24px', fontWeight: 'bold' as const, color: '#2d9d64', margin: '0' }
const h1 = { fontSize: '20px', fontWeight: '600' as const, color: '#1a1a2e', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#3a3a4a', lineHeight: '1.6', margin: '0 0 16px' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = {
  backgroundColor: '#2d9d64',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  padding: '12px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
}
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footerText = { fontSize: '13px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 8px' }
