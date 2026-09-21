export interface CreatePaymentParams {
  orderId: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  description: string
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  qrCode?: string
  vaNumber?: string
  expiresAt?: Date
  error?: string
}

export interface PaymentStatus {
  transactionId: string
  status: 'pending' | 'success' | 'failed' | 'expired'
  amount?: number
  paidAt?: Date
}

export interface WebhookVerification {
  isValid: boolean
  transactionId?: string
  status?: 'pending' | 'success' | 'failed' | 'expired'
  amount?: number
  paidAt?: Date
}

export interface PaymentGateway {
  name: string
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>
  verifyWebhook(payload: any, signature?: string): Promise<WebhookVerification>
  cancelPayment(transactionId: string): Promise<boolean>
}
