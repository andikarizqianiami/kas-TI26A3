export interface SendMessageParams {
  to: string // Phone number with country code
  message: string
}

export interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface WhatsAppProvider {
  name: string
  sendMessage(params: SendMessageParams): Promise<SendMessageResult>
}
