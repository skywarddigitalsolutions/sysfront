'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import { User } from '@/lib/types'
import { httpClient } from '@/lib/api/httpClient'
import { canAccessRoute } from '@/lib/route-protection'

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  canAccess: (route: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Load user from sessionStorage on mount
    const storedUser = sessionStorage.getItem('user')
    const storedToken = sessionStorage.getItem('token')

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser)
      setUser({ ...userData, token: storedToken })
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Use httpClient to communicate with real backend
      const response = await httpClient.login(username, password)

      // Extract data from backend response (now includes role!)
      const { id, userName, token, role } = response

      // Create user object (ignore password hash from backend)
      // Map backend role to frontend role type
      // Backend: 'admin' | 'cajero' | 'cocina'
      // Frontend: 'ADMIN' | 'CAJA' | 'COCINA'
      const roleMap: Record<string, 'ADMIN' | 'CAJA' | 'COCINA'> = {
        'admin': 'ADMIN',
        'cajero': 'CAJA',
        'cocina': 'COCINA'
      }

      // Validar que el rol venga del backend y exista en el roleMap
      if (!role) {
        throw new Error('El backend no proporcionó un rol para el usuario')
      }

      const mappedRole = roleMap[role]
      if (!mappedRole) {
        throw new Error(`Rol desconocido recibido del backend: ${role}`)
      }

      const userData: User = {
        id,
        username: userName,
        role: mappedRole,
        token
      }

      // Save to sessionStorage (more secure than localStorage)
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify({
        id,
        username: userName,
        role: mappedRole
      }))

      // Update state
      setUser(userData)

      return true
    } catch (error) {
      console.error('Error durante el login:', error)
      return false
    }
  }

  const logout = (): void => {
    setUser(null)
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
  }

  const canAccess = (route: string): boolean => {
    return canAccessRoute(user?.role || null, route)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')

  return context
}