import UsuariosDashboard from '@/components/Dashboard/Users'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'ABM de Usuarios',
    description: 'Gestión de usuarios',
}

export default function CreateUsersPage() {
    return (
        <UsuariosDashboard />
    )
}

