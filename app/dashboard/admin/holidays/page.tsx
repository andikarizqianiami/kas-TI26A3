import { Metadata } from 'next'
import HolidaysClient from './client'

export const metadata: Metadata = {
  title: 'Kelola Hari Libur | KAS TI26A3',
  description: 'Kelola hari libur dan tanggal merah untuk penjadwalan kas'
}

export default function HolidaysPage() {
  return <HolidaysClient />
}
