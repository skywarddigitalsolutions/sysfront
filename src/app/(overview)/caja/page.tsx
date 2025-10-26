import CajaDashboard from '@/components/caja-dashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel de Caja',
  description: 'Gestión de pedidos y ventas',
}

export default function CajaPage() {
  return (
    <CajaDashboard />
  )
}

