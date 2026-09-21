import { PaymentGateway } from './types'
import { MidtransProvider } from './providers/midtrans'
import { XenditProvider } from './providers/xendit'

/**
 * Get the active payment gateway provider based on environment configuration
 */
export function getPaymentGateway(): PaymentGateway {
  const provider = process.env.PAYMENT_PROVIDER?.toLowerCase() || 'midtrans'

  switch (provider) {
    case 'midtrans':
      return new MidtransProvider()
    case 'xendit':
      return new XenditProvider()
    default:
      console.warn(`Unknown payment provider: ${provider}, falling back to Midtrans`)
      return new MidtransProvider()
  }
}

export * from './types'
