import { WhatsAppProvider, SendMessageParams, SendMessageResult } from '../types'

export class FontteProvider implements WhatsAppProvider {
  name = 'fonnte'
  private apiUrl: string
  private apiKey: string

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send'
    this.apiKey = process.env.WHATSAPP_API_KEY || ''
  }

  async sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
    try {
      const formData = new URLSearchParams()
      formData.append('target', params.to)
      formData.append('message', params.message)
      formData.append('countryCode', '62')

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data.status === false) {
        return {
          success: false,
          error: data.reason || data.message || 'Failed to send message',
        }
      }

      return {
        success: true,
        messageId: data.id || data.message_id,
      }
    } catch (error) {
      console.error('Fonnte send message error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
