'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useAuth } from '../Context/AuthContext'
import { getDefaultRouteForRole } from '@/lib/route-protection'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { login, user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const success = await login(username, password)
      if (success) {
        // Get user from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          const defaultRoute = getDefaultRouteForRole(parsedUser.role)

          // Pequeño delay para asegurar que el estado se actualice
          setTimeout(() => {
            router.push(defaultRoute)
          }, 100)
        } else {
          router.push('/')
        }
      } else {
        setError('Credenciales inválidas')
      }
    } catch {
      setError('Error al iniciar sesión. Por favor, intente de nuevo.')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          {error && <p className="text-red-500">{error}</p>}
        </CardFooter>
      </Card>
    </div>
  )
}

