import CajaDashboard from '@/components/Dashboard/Cashier'
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

