import { Metadata } from 'next'
import ScheduleClient from './client'

export const metadata: Metadata = {
  title: 'Jadwal Kas Mingguan | KAS TI26A3',
  description: 'Atur jadwal pembayaran kas per minggu'
}

export default function SchedulePage() {
  return <ScheduleClient />
}
