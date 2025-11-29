"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Home,
  BarChart3,
  CreditCard,
  ChefHat,
  Package,
  TrendingUp,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/sidebar"
import { useAuth } from "../Context/AuthContext"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AppSidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const menuItems = [
    { icon: Home, label: "Inicio", href: "/" },
    ...(user?.role === "ADMIN"
      ? [
        { icon: BarChart3, label: "Estadísticas", href: "/statistics" },
        { icon: CreditCard, label: "Caja", href: "/cashier" },
        { icon: ChefHat, label: "Cocina", href: "/kitchen" },
        { icon: Package, label: "Inventario", href: "/inventory" },
        { icon: TrendingUp, label: "Ventas", href: "/sales" },
        { icon: Calendar, label: "Eventos", href: "/create-event" },
        { icon: User, label: "Usuarios", href: "/create-users" },
      ]
      : []),
    ...(user?.role === "CAJA" ? [{ icon: CreditCard, label: "Caja", href: "/cashier" }] : []),
    ...(user?.role === "COCINA"
      ? [
        { icon: ChefHat, label: "Cocina", href: "/kitchen" },
        { icon: Package, label: "Inventario", href: "/inventory" },
      ]
      : []),
  ]

  return (
    <TooltipProvider>
      <Sidebar
        className={cn("relative transition-all duration-300 border-r border-white/10", isCollapsed ? "w-16" : "w-64")}
      >
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="outline"
          size="icon"
          className="absolute -right-4 top-7 z-50 h-6 w-6 rounded-full border-2 bg-sidebar  hover:bg-blue-900 shadow-lg"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-white" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-white" />
          )}
        </Button>

        <SidebarHeader
          className={cn(
            "flex items-center p-4 transition-all duration-300",
            isCollapsed ? "justify-center flex-col gap-2" : "flex-row gap-3",
          )}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className={cn("transition-all duration-300", isCollapsed ? "w-8 h-8" : "w-12 h-12")}
          />
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-white">
              Batallón 1
            </h2>
          )}
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel>General</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.href}
                              className="flex items-center justify-center transition-all duration-200"
                            >
                              <item.icon className="h-5 w-5" />
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild>
                        <Link href={item.href} className="flex items-center gap-3 transition-all duration-200">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleLogout} variant="ghost" className="w-full justify-center px-2">
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Cerrar Sesión</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  )
}
