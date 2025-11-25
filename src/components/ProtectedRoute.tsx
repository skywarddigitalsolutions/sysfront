'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/Context/AuthContext'
import { canAccessRoute, getDefaultRouteForRole } from '@/lib/route-protection'
import { useToast } from '@/hooks/use-toast'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRoles: Array<'ADMIN' | 'CAJA' | 'COCINA'>
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const { user } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const { toast } = useToast()

    useEffect(() => {
        // Check if user is authenticated
        if (!user) {
            router.push('/login')
            return
        }

        // Check if user has required role
        if (!canAccessRoute(user.role, pathname)) {
            toast({
                title: 'Acceso Denegado',
                description: 'No tienes permisos para acceder a esta página.',
                variant: 'destructive',
            })

            // Redirect to user's default route instead of home
            const defaultRoute = getDefaultRouteForRole(user.role)
            router.push(defaultRoute)
            return
        }
    }, [user, pathname, router, toast])

    // While checking auth, don't render anything
    if (!user) return null

    // If user doesn't have access, don't render (will redirect)
    if (!canAccessRoute(user.role, pathname)) return null

    // If user passes all checks, render children
    return <>{children}</>
}
