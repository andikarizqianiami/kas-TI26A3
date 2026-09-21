import crypto from 'crypto'
import {
  PaymentGateway,
  CreatePaymentParams,
  PaymentResult,
  PaymentStatus,
  WebhookVerification,
} from '../types'

export class XenditProvider implements PaymentGateway {
  name = 'xendit'
  private secretKey: string
  private webhookToken: string
  private isProduction: boolean
  private apiUrl: string

  constructor() {
    this.secretKey = process.env.XENDIT_SECRET_KEY || ''
    this.webhookToken = process.env.XENDIT_WEBHOOK_TOKEN || ''
    this.isProduction = process.env.XENDIT_IS_PRODUCTION === 'true'
    this.apiUrl = 'https://api.xendit.co'
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(this.secretKey + ':').toString('base64')
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      // Create invoice via Xendit
      const payload = {
        external_id: params.orderId,
        amount: params.amount,
        payer_email: params.customerEmail,
        description: params.description,
        customer: {
          given_names: params.customerName,
          email: params.customerEmail,
          mobile_number: params.customerPhone,
        },
        currency: 'IDR',
        invoice_duration: 86400, // 24 hours
        success_redirect_url: process.env.NEXTAUTH_URL + '/dashboard/payments/success',
        failure_redirect_url: process.env.NEXTAUTH_URL + '/dashboard/payments/failed',
      }

      const response = await fetch(`${this.apiUrl}/v2/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Payment creation failed',
        }
      }

      return {
        success: true,
        transactionId: data.id,
        paymentUrl: data.invoice_url,
        expiresAt: data.expiry_date ? new Date(data.expiry_date) : undefined,
      }
    } catch (error) {
      console.error('Xendit payment creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${this.apiUrl}/v2/invoices/${transactionId}`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      })

      const data = await response.json()

      const statusMap: Record<string, 'pending' | 'success' | 'failed' | 'expired'> = {
        PENDING: 'pending',
        PAID: 'success',
        SETTLED: 'success',
        EXPIRED: 'expired',
        FAILED: 'failed',
      }

      return {
        transactionId: data.id,
        status: statusMap[data.status] || 'pending',
        amount: data.amount,
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
      }
    } catch (error) {
      console.error('Xendit status check error:', error)
      return {
        transactionId,
        status: 'failed',
      }
    }
  }

  async verifyWebhook(payload: any, signature?: string): Promise<WebhookVerification> {
    try {
      // Verify webhook token
      if (payload.webhook_token !== this.webhookToken) {
        return { isValid: false }
      }

      const statusMap: Record<string, 'pending' | 'success' | 'failed' | 'expired'> = {
        PENDING: 'pending',
        PAID: 'success',
        SETTLED: 'success',
        EXPIRED: 'expired',
        FAILED: 'failed',
      }

      return {
        isValid: true,
        transactionId: payload.id,
        status: statusMap[payload.status] || 'pending',
        amount: payload.amount,
        paidAt: payload.paid_at ? new Date(payload.paid_at) : undefined,
      }
    } catch (error) {
      console.error('Xendit webhook verification error:', error)
      return { isValid: false }
    }
  }

  async cancelPayment(transactionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/v2/invoices/${transactionId}/expire!`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
        },
      })

      return response.ok
    } catch (error) {
      console.error('Xendit cancel payment error:', error)
      return false
    }
  }
}
