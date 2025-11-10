import CocinaDashboard from '@/components/Dashboard/Kitchen'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel de Cocina',
  description: 'Gestión de pedidos en cocina',
}

export default function CocinaPage() {
  return (
    <CocinaDashboard />
  )
}

