import AdminDashboard from '@/components/admin-dashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel de Administración',
  description: 'Gestión de productos, eventos y usuarios',
}

export default function AdminPage() {
  return (
    <AdminDashboard />
  )
}

