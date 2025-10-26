'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser } from '@/lib/api/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CreateUser() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'CAJA' | 'COCINA'>('CAJA')
  const queryClient = useQueryClient()

  const userMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setUsername('')
      setPassword('')
      setRole('CAJA')
    },
  })

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    userMutation.mutate({ username, password, role })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUserSubmit} className="space-y-4">
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
          <Select value={role} onValueChange={(value) => setRole(value as 'ADMIN' | 'CAJA' | 'COCINA')}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="CAJA">Caja</SelectItem>
              <SelectItem value="COCINA">Cocina</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={userMutation.isPending}>
            {userMutation.isPending ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}