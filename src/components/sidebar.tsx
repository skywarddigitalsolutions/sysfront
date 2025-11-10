'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, ClipboardList, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { useAuth } from '../Context/AuthContext'

export function AppSidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const menuItems = [
    { icon: Home, label: 'Inicio', href: '/' },
    ...(user?.role === 'ADMIN' ? [
      { icon: ClipboardList, label: 'Estadísticas', href: '/statistics' },
      { icon: ClipboardList, label: 'Caja', href: '/cashier' },
      { icon: ClipboardList, label: 'Cocina', href: '/kitchen' },
      { icon: ClipboardList, label: 'Punto de Entrega', href: '/delivery-point' },
      { icon: ClipboardList, label: 'Ventas', href: '/sales' },
      { icon: ClipboardList, label: 'Eventos', href: '/create-event' },

    ] : []),
    ...(user?.role === 'CAJA' ? [
      { icon: ClipboardList, label: 'Caja', href: '/cashier' },
    ] : []),
    ...(user?.role === 'COCINA' ? [
      { icon: ClipboardList, label: 'Cocina', href: '/kitchen' },
      { icon: ClipboardList, label: 'Punto de Entrega', href: '/delivery-point' },

    ] : []),
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center p-4 flex-row">
        <img src="/logo.png" alt="Logo" className="w-12 h-12" />
        <h2 className="text-xl font-bold">Batallón 1</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}