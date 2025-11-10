"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEvents, fetchEventStatistics } from "@/lib/api/api"
import type { Event, EventStatistics } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/components/AuthContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowUpRight,
  DollarSign,
  Package,
  TrendingUp,
  ChefHat,
  Receipt,
  Calendar,
  ArrowRight,
  Clock,
  TrendingDown,
  Truck,
  ShoppingBag,
  BarChart3,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function CountdownTimer({ targetDate }: { targetDate: string | Date }) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const timeUnits = [
    { label: "Días", value: timeLeft.days, id: "countdown-days" },
    { label: "Horas", value: timeLeft.hours, id: "countdown-hours" },
    { label: "Minutos", value: timeLeft.minutes, id: "countdown-minutes" },
    { label: "Segundos", value: timeLeft.seconds, id: "countdown-seconds" },
  ]

  if (!mounted) {
    return (
      <div className="flex gap-3 sm:gap-4">
        {timeUnits.map((item) => (
          <div key={item.id} className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 sm:px-4 py-2 sm:py-3 min-w-[60px] sm:min-w-[80px]">
              <span className="text-2xl sm:text-4xl font-bold text-white">00</span>
            </div>
            <span className="text-xs sm:text-sm text-white/80 mt-1 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 sm:gap-4">
      {timeUnits.map((item) => (
        <div key={item.id} className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 sm:px-4 py-2 sm:py-3 min-w-[60px] sm:min-w-[80px]">
            <span className="text-2xl sm:text-4xl font-bold text-white">{String(item.value).padStart(2, "0")}</span>
          </div>
          <span className="text-xs sm:text-sm text-white/80 mt-1 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

const navigationItems = [
  { name: "Inicio", icon: Home, path: "/inicio" },
  { name: "Estadísticas", icon: BarChart3, path: "/estadisticas" },
  { name: "Caja", icon: Receipt, path: "/caja" },
  { name: "Cocina", icon: ChefHat, path: "/cocina" },
  { name: "Entrega", icon: Truck, path: "/entrega" },
  { name: "Ventas", icon: ShoppingBag, path: "/ventas" },
  { name: "Eventos", icon: Calendar, path: "/eventos" },
  { name: "Inventario", icon: Package, path: "/inventario" },
]

export default function Inicio() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [itemFilter, setItemFilter] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "quantity" | "revenue">("quantity")

  const { data: events } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: fetchEvents,
  })

  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) setSelectedEventId(events[0].id)
  }, [events, selectedEventId])

  const { data: statistics } = useQuery<EventStatistics>({
    queryKey: ["eventStatistics", selectedEventId],
    queryFn: () => fetchEventStatistics(selectedEventId),
    enabled: !!selectedEventId,
  })

  const chartData = useMemo(() => {
    if (!statistics) return []

    let data = Object.entries(statistics.topSellingItems).map(([name, quantity]) => ({
      name,
      quantity,
      revenue: quantity * 10,
    }))

    if (itemFilter) {
      data = data.filter((item) => item.name.toLowerCase().includes(itemFilter.toLowerCase()))
    }

    data.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "quantity") return b.quantity - a.quantity
      if (sortBy === "revenue") return b.revenue - a.revenue
      return 0
    })

    return data.slice(0, 10)
  }, [statistics, itemFilter, sortBy])

  const profit = statistics ? statistics.totalRevenue - statistics.totalInvestment : 0
  const profitPercentage =
    statistics && statistics.totalInvestment > 0 ? ((profit / statistics.totalInvestment) * 100).toFixed(2) : "0.00"

  const selectedEvent = events?.find((e) => e.id === selectedEventId)
  const nextEvent = events?.[0] || { name: "Próximo Evento", date: "2025-12-31T18:00:00" }

  useEffect(() => {
    if (user) {
      setIsLoading(false)
    }
  }, [user])

  if (isLoading || !user) return null

  return (
    <main className="flex flex-col min-h-screen bg-black">
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E2C6D] via-[#2a3d8f] to-[#1E2C6D] p-8 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#D9251C] rounded-full blur-[120px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-10" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.5fr,1fr]">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Próximo Evento</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{nextEvent.name}</h2>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <CountdownTimer targetDate={nextEvent.date} />

                <div className="flex flex-wrap gap-3 mt-2">
                  <Button
                    onClick={() => router.push(`/events?selected=${selectedEventId}`)}
                    className="bg-white text-[#1E2C6D] hover:bg-white/90 font-semibold shadow-lg group"
                  >
                    Ver Detalles del Evento
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm bg-transparent"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Todos los Eventos
                  </Button>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Inversión del Evento</h3>
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Inversión Total</p>
                  <p className="text-3xl font-bold text-white">${statistics?.totalInvestment.toFixed(2) || "0.00"}</p>
                </div>

                <div className="h-px bg-white/20" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Insumos Agregados</p>
                    <p className="text-xl font-bold text-blue-100"> 45</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Productos armados </p>
                    <p className={`text-xl font-bold text-blue-100`}>
                      20
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Resumen de Eventos</h1>
            <p className="text-white/60 mt-1">
              Bienvenido, <span className="font-medium text-white">{user.username}</span> · {user.role}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {selectedEvent && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Calendar className="h-4 w-4" />
                <span>Evento actual</span>
              </div>
            )}
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full sm:w-[280px] h-11 bg-gradient-blue text-white border-white/20 hover:border-white/40 font-medium backdrop-blur-sm">
                <SelectValue placeholder="Selecciona un evento" />
              </SelectTrigger>
              <SelectContent>
                {events?.map((event, index) => (
                  <SelectItem key={`event-${event.id}-${index}`} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {statistics && (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
            <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1E2C6D]/30 to-[#1E2C6D]/10 border border-[#1E2C6D]/50 hover:border-[#1E2C6D]/70 transition-all shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">Inversión</CardTitle>
                <DollarSign className="h-5 w-5 text-[#1E2C6D]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">${statistics.totalInvestment.toFixed(2)}</div>
                <p className="text-xs text-white/60 mt-1">Capital invertido</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 hover:border-green-500/50 transition-all shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">Ganancia</CardTitle>
                <ArrowUpRight className="h-5 w-5 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${profit >= 0 ? "text-green-400" : "text-green-400"}`}>
                  ${Math.abs(profit).toFixed(2)}
                </div>
                <p className="text-xs text-white/60 mt-1">Ganancia neta</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 hover:border-orange-500/50 transition-all shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">Sobrante</CardTitle>
                <Package className="h-5 w-5 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">12 items</div>
                <p className="text-xs text-white/60 mt-1">Productos sin vender</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-white/40 transition-all shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">Ver Todos</CardTitle>
                <ArrowRight className="h-5 w-5 text-white/60" />
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push("/estadisticas")}
                  className="w-full mt-2 bg-[#1E2C6D] hover:bg-[#1E2C6D]/80 text-white font-medium"
                >
                  Estadísticas Completas
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Acceso Rápido</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-[#1E2C6D]/50 p-6 transition-all duration-300 hover:bg-gradient-to-br hover:from-[#1E2C6D]/20 hover:to-[#1E2C6D]/10 shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1E2C6D] via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />
                  <div className="relative flex flex-col items-center justify-center gap-3 text-center">
                    <div className="p-3 rounded-lg bg-white/10 group-hover:bg-[#1E2C6D]/30 transition-all">
                      <Icon className="h-7 w-7 text-white/70 group-hover:text-[#1E2C6D] transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                      {item.name}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
