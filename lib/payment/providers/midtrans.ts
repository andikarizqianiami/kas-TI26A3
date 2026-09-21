import crypto from 'crypto'
import {
  PaymentGateway,
  CreatePaymentParams,
  PaymentResult,
  PaymentStatus,
  WebhookVerification,
} from '../types'

export class MidtransProvider implements PaymentGateway {
  name = 'midtrans'
  private serverKey: string
  private clientKey: string
  private isProduction: boolean
  private apiUrl: string

  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || ''
    this.isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    this.apiUrl = this.isProduction
      ? 'https://api.midtrans.com'
      : 'https://api.sandbox.midtrans.com'
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(this.serverKey + ':').toString('base64')
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const payload = {
        transaction_details: {
          order_id: params.orderId,
          gross_amount: params.amount,
        },
        customer_details: {
          first_name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone,
        },
        item_details: [
          {
            id: 'kas-mingguan',
            price: params.amount,
            quantity: 1,
            name: params.description,
          },
        ],
        enabled_payments: ['gopay', 'shopeepay', 'qris', 'bca_va', 'bni_va', 'bri_va'],
      }

      const response = await fetch(`${this.apiUrl}/v2/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.getAuthHeader(),
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.status_message || 'Payment creation failed',
        }
      }

      // Extract payment info based on payment type
      let qrCode: string | undefined
      let vaNumber: string | undefined

      if (data.actions) {
        const qrAction = data.actions.find((a: any) => a.name === 'generate-qr-code')
        if (qrAction) {
          qrCode = qrAction.url
        }
      }

      if (data.va_numbers && data.va_numbers.length > 0) {
        vaNumber = data.va_numbers[0].va_number
      }

      return {
        success: true,
        transactionId: data.transaction_id,
        paymentUrl: data.redirect_url,
        qrCode,
        vaNumber,
        expiresAt: data.expiry_time ? new Date(data.expiry_time) : undefined,
      }
    } catch (error) {
      console.error('Midtrans payment creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${this.apiUrl}/v2/${transactionId}/status`, {
        headers: {
          Authorization: this.getAuthHeader(),
          Accept: 'application/json',
        },
      })

      const data = await response.json()

      const statusMap: Record<string, 'pending' | 'success' | 'failed' | 'expired'> = {
        pending: 'pending',
        settlement: 'success',
        capture: 'success',
        deny: 'failed',
        cancel: 'failed',
        expire: 'expired',
        failure: 'failed',
      }

      return {
        transactionId: data.transaction_id,
        status: statusMap[data.transaction_status] || 'pending',
        amount: data.gross_amount ? parseInt(data.gross_amount) : undefined,
        paidAt: data.settlement_time ? new Date(data.settlement_time) : undefined,
      }
    } catch (error) {
      console.error('Midtrans status check error:', error)
      return {
        transactionId,
        status: 'failed',
      }
    }
  }

  async verifyWebhook(payload: any, signature?: string): Promise<WebhookVerification> {
    try {
      // Verify signature hash
      const { order_id, status_code, gross_amount } = payload
      const signatureKey = `${order_id}${status_code}${gross_amount}${this.serverKey}`
      const calculatedSignature = crypto
        .createHash('sha512')
        .update(signatureKey)
        .digest('hex')

      if (signature && signature !== calculatedSignature) {
        return { isValid: false }
      }

      const statusMap: Record<string, 'pending' | 'success' | 'failed' | 'expired'> = {
        pending: 'pending',
        settlement: 'success',
        capture: 'success',
        deny: 'failed',
        cancel: 'failed',
        expire: 'expired',
        failure: 'failed',
      }

      return {
        isValid: true,
        transactionId: payload.transaction_id,
        status: statusMap[payload.transaction_status] || 'pending',
        amount: payload.gross_amount ? parseInt(payload.gross_amount) : undefined,
        paidAt: payload.settlement_time ? new Date(payload.settlement_time) : undefined,
      }
    } catch (error) {
      console.error('Midtrans webhook verification error:', error)
      return { isValid: false }
    }
  }

  async cancelPayment(transactionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/v2/${transactionId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
          Accept: 'application/json',
        },
      })

      return response.ok
    } catch (error) {
      console.error('Midtrans cancel payment error:', error)
      return false
    }
  }
}
