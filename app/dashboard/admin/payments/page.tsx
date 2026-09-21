'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import { CheckCircle, XCircle, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function PaymentVerificationPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingPayments()
  }, [])

  const fetchPendingPayments = async () => {
    try {
      const res = await fetch('/api/payments/pending')
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (paymentId: string) => {
    if (!confirm('Apakah Anda yakin ingin memverifikasi pembayaran ini?')) {
      return
    }

    setProcessing(paymentId)
    try {
      const res = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
      })

      if (res.ok) {
        alert('Pembayaran berhasil diverifikasi!')
        fetchPendingPayments()
        setSelectedPayment(null)
      } else {
        const data = await res.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert('Gagal memverifikasi pembayaran')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (paymentId: string) => {
    if (!rejectReason.trim()) {
      alert('Alasan penolakan harus diisi')
      return
    }

    setProcessing(paymentId)
    try {
      const res = await fetch(`/api/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      })

      if (res.ok) {
        alert('Pembayaran ditolak')
        fetchPendingPayments()
        setSelectedPayment(null)
        setRejecting(false)
        setRejectReason('')
      } else {
        const data = await res.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert('Gagal menolak pembayaran')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Verifikasi Pembayaran</h1>
              <p className="text-gray-600">Review dan verifikasi bukti pembayaran mahasiswa</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary */}
        {summary && (
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Menunggu Verifikasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {summary.totalPending}
                </div>
                <p className="text-sm text-gray-500 mt-1">Pembayaran</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Nominal Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(summary.totalAmount)}
                </div>
                <p className="text-sm text-gray-500 mt-1">Belum diverifikasi</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pembayaran Pending</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Tidak ada pembayaran yang menunggu verifikasi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{payment.student.name}</h3>
                          <Badge variant="warning">Pending</Badge>
                        </div>
                        
                        <div className="grid gap-2 text-sm text-gray-600">
                          <p><span className="font-medium">NIM:</span> {payment.student.nim}</p>
                          <p><span className="font-medium">Tagihan:</span> {payment.bill.name}</p>
                          <p><span className="font-medium">Periode:</span> {payment.bill.weekPeriod}</p>
                          <p><span className="font-medium">Nominal:</span> {formatCurrency(payment.amount)}</p>
                          <p><span className="font-medium">Tanggal Bayar:</span> {formatDateTime(payment.paymentDate)}</p>
                          <p><span className="font-medium">Upload:</span> {formatDateTime(payment.createdAt)}</p>
                          {payment.paymentNotes && (
                            <p><span className="font-medium">Catatan:</span> {payment.paymentNotes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Bukti
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleVerify(payment.id)}
                          disabled={processing === payment.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {processing === payment.id ? 'Proses...' : 'Verifikasi'}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedPayment(payment)
                            setRejecting(true)
                          }}
                          disabled={processing === payment.id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Tolak
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal: View Proof */}
      {selectedPayment && !rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Bukti Pembayaran</CardTitle>
              <p className="text-sm text-gray-600">
                {selectedPayment.student.name} - {selectedPayment.student.nim}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Payment Info */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="font-semibold mb-2">Informasi Pembayaran</h4>
                  <div className="grid gap-2 text-sm">
                    <p><span className="font-medium">Tagihan:</span> {selectedPayment.bill.name}</p>
                    <p><span className="font-medium">Nominal:</span> {formatCurrency(selectedPayment.amount)}</p>
                    <p><span className="font-medium">Tanggal Bayar:</span> {formatDateTime(selectedPayment.paymentDate)}</p>
                    {selectedPayment.paymentNotes && (
                      <p><span className="font-medium">Catatan:</span> {selectedPayment.paymentNotes}</p>
                    )}
                  </div>
                </div>

                {/* Proof Image */}
                <div>
                  <h4 className="font-semibold mb-2">Bukti Transfer</h4>
                  {selectedPayment.proofImageUrl ? (
                    <div className="relative h-96 border rounded-lg overflow-hidden">
                      <Image
                        src={selectedPayment.proofImageUrl}
                        alt="Bukti pembayaran"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500">Bukti tidak tersedia</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button
                    className="flex-1"
                    onClick={() => handleVerify(selectedPayment.id)}
                    disabled={processing === selectedPayment.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verifikasi & Setujui
                  </Button>
                  
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => setRejecting(true)}
                    disabled={processing === selectedPayment.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Tolak
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPayment(null)}
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Reject Form */}
      {selectedPayment && rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Tolak Pembayaran</CardTitle>
              <p className="text-sm text-gray-600">
                {selectedPayment.student.name}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                  <p className="font-semibold">Perhatian!</p>
                  <p>Alasan penolakan akan dikirim ke mahasiswa. Pastikan alasan jelas dan membantu.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Alasan Penolakan *</label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 p-3 text-sm"
                    rows={4}
                    placeholder="Contoh: Bukti transfer tidak jelas, nominal tidak sesuai, dll"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleReject(selectedPayment.id)}
                    disabled={!rejectReason.trim() || processing === selectedPayment.id}
                  >
                    {processing === selectedPayment.id ? 'Proses...' : 'Tolak Pembayaran'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejecting(false)
                      setRejectReason('')
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
