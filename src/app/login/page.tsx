import LoginForm from '@/components/login-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Acceso al sistema de pedidos',
}

export default function LoginPage() {
  return <LoginForm />
}

