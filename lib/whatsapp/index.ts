import { WhatsAppProvider } from './types'
import { FontteProvider } from './providers/fonnte'

/**
 * Get the active WhatsApp provider based on environment configuration
 */
export function getWhatsAppProvider(): WhatsAppProvider {
  const provider = process.env.WHATSAPP_PROVIDER?.toLowerCase() || 'fonnte'

  switch (provider) {
    case 'fonnte':
      return new FontteProvider()
    default:
      console.warn(`Unknown WhatsApp provider: ${provider}, falling back to Fonnte`)
      return new FontteProvider()
  }
}

export * from './types'
