"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEvents, fetchEventStatistics } from "@/lib/api/events/api"
import type { Event, EventStatistics } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "../../../Context/AuthContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  ArrowDownLeftIcon,
  ShoppingBagIcon,
} from "lucide-react"

export default function statistics() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [selectedEventId, setSelectedEventId] = useState<string>("")
const [sortBy, setSortBy] = useState<
  "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc"
>("quantityDesc")
  const [filterSearch, setFilterSearch] = useState<string>("")

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

  const filteredAndSortedItems = statistics
    ? Object.entries(statistics.topSellingItems)
        .filter(([name]) => name.toLowerCase().includes(filterSearch.toLowerCase()))
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => {
          switch (sortBy) {
            case "quantityDesc":
              return b.quantity - a.quantity
            case "quantityAsc":
              return a.quantity - b.quantity
            case "nameAsc": 
              return a.name.localeCompare(b.name)
            case "nameDesc":
              return b.name.localeCompare(a.name)
            default:
              return 0
          }
        })
        .slice(0, 5)
    : []

  const chartData = filteredAndSortedItems

  const profit = statistics ? statistics.totalRevenue - statistics.totalInvestment : 0
  const profitPercentage =
    statistics && statistics.totalInvestment > 0 ? ((profit / statistics.totalInvestment) * 100).toFixed(2) : "0.00"

  const itemsRemaining = statistics ? Object.values(statistics.topSellingItems).reduce((a, b) => a + b, 0) : 0

  const stockAlerts = statistics
    ? [
      { product: "Producto A", current: 5, minimum: 10 },
      { product: "Producto B", current: 3, minimum: 8 },
    ]
    : []

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [user, isLoading])

  if (isLoading || !user) return null

  return (
    <main className="flex-1 p-6 space-y-8 bg-background min-h-screen">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
          Estadísticas del Evento
        </h1>
      </div>

      <div className="backdrop-blur-lg bg-gradient-blue border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-300">
            
            {/* IZQUIERDA: Nombre del Evento y Fecha */}
            <div className="space-y-1 mb-4 md:mb-0">
                <h3 className="text-3xl font-bold text-blue-100 flex items-center">
                    {events?.find((e) => e.id === selectedEventId)?.name}
                </h3>
                <p className="text-sm text-gray-200 ">
                    Fecha: 2 de Octubre
                </p>
            </div>

            {/* DERECHA: Selector de Evento Moderno */}
            <div className="flex items-center space-x-3">
                
                <label className="text-sm font-medium text-gray-400 hidden sm:block">Cambiar Evento:</label>
                
                {/* El Select se integra con la estética de Glassmorphism */}
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    
                    {/* El Trigger parece un botón de acción estilizado */}
                    <SelectTrigger className="w-full md:w-[250px] bg-white/10 border-white/30 text-white 
                                              hover:bg-white/20 transition-colors duration-200">
                        <SelectValue placeholder="Seleccionar otro evento..." />
                    </SelectTrigger>
                    
                    {/* El contenido del Select mantiene el tema Oscuro */}
                    <SelectContent className="bg-[var(--color-brand-black)] border-white/20">
                        {events?.map((event) => (
                            <SelectItem 
                                key={event.id} 
                                value={event.id}
                                className="text-white hover:bg-gray-800 focus:bg-gray-800"
                            >
                                {event.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

      {statistics && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Total Pedidos */}
            <Card className="backdrop-blur-xl bg-gradient-to-br from-black to-gray-700/50 border border-gray-500/30 hover:border-gray-500/50 transition-all shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pedidos</CardTitle>
                <ShoppingCart className="h-5 w-5 text-gray-700" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{statistics.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">+{statistics.pendingOrders} pendientes</p>
              </CardContent>
            </Card>

            {/* Inversión */}
            <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1E2C6D]/30 to-[#1E2C6D]/10 border border-[#1E2C6D]/50 hover:border-[#1E2C6D]/70 transition-all shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Inversión</CardTitle>
                <ArrowDownLeftIcon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">${statistics.totalInvestment.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Costo de productos</p>
              </CardContent>
            </Card>

            {/* Ingresos Totales */}
            <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 hover:border-orange-500/50 transition-all shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos</CardTitle>
                <DollarSign className="h-5 w-5 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">${statistics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Totales
                </p>
              </CardContent>
            </Card>

            {/* Ticket promedio */}
            <Card className="backdrop-blur-xl bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/30 hover:border-sky-500/5 transition-all shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
                <ShoppingBagIcon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">${statistics.averageOrderValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Por pedido</p>
              </CardContent>
            </Card>

            {/* Ganancia */}
            <Card
              className={`backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 hover:border-green-500/50 transition-all shadow-xl`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ganancia</CardTitle>
                {profit >= 0 ? (
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  ${profit.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {profit >= 0 ? "+" : ""}
                  {profitPercentage}% margen
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gráfico Top Items */}
            <Card className="border border-white-1 bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Top Items Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                     <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#1E2C6D" />
                          <stop offset="50%" stopColor="#2A3D8F" />
                          <stop offset="100%" stopColor="#1E2C6D" />
                        </linearGradient>
                      </defs>
                    <XAxis dataKey="name" stroke="#ffffff" />
                    <YAxis stroke="#ffffff" />
                    <RechartsTooltip
                      contentStyle={{  background: "linear-gradient(135deg, #1E2C6D 0%, #2A3D8F 50%, #1E2C6D 100%)", border: "1px solid #ffffff", borderRadius: "20px", backdropFilter: "blur(10px)" }}
                      cursor={{ fill: "rgba(29, 44, 109, 0.1)" }}
                      labelStyle={{ color: "#758FC9" }}
                    />
                    <Bar dataKey="quantity" fill="url(#barGradient)" name="Cantidad Vendida" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>


            {/* Tabla Items con Filtro y Ordenamiento */}
            <Card className="border border-white-1 bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Ítems Vendidos - Filtro y Ordenamiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Buscar ítem..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="flex-1 px-3 py-2 bg-blue-200/10 border border-white-1 rounded-md text-sm text-foreground placeholder-muted-foreground"
                  />
                 <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as
                          | "quantityDesc"
                          | "quantityAsc"
                          | "nameAsc"
                          | "nameDesc"
                      )
                    }
                    className="px-3 py-2 bg-blue-200/10 rounded-md text-sm text-foreground"
                  >
                    <option className="bg-gray-700 text-white" value="quantityDesc">Cantidad (Mayor a Menor)</option>
                    <option className="bg-gray-700 text-white" value="quantityAsc">Cantidad (Menor a Mayor)</option>
                    <option className="bg-gray-700 text-white" value="nameAsc">Nombre (A-Z)</option>
                    <option className="bg-gray-700 text-white" value="nameDesc">Nombre (Z-A)</option>
                  </select>

                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredAndSortedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gradient-blue rounded-lg border border-white-1 hover:border-primary transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <span className="text-sm font-bold text-blue-900 bg-white px-3 py-1 rounded-full">
                        {item.quantity} vendidos
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
        <div className="grid lg:grid-cols-2">
            {/* Sobrante del Evento */}
            <Card className="border border-white-1 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Sobrante del Evento</CardTitle>
                <RotateCcw className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-blue rounded-lg border border-primary/20">
                  <div>
                    <p className="text-sm text-muted-foreground">Ítems sin vender</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{itemsRemaining}</p>
                  </div>
                  <Package className="h-12 w-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            {/* Alertas de Stock */}
            <Card className="border border-white-1 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Falta de Stock</CardTitle>
                <AlertCircle className="h-5 w-5 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stockAlerts.length > 0 ? (
                    stockAlerts.map((alert, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-foreground">{alert.product}</p>
                          <span className="text-xs bg-red-400 text-red-900 px-2 py-1 rounded">¡Bajo!</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Actual: <span className="text-red-400 font-bold">{alert.current}</span> / Mínimo:{" "}
                          <span className="font-bold text-green-400">{alert.minimum}</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-emerald-950/20 rounded-lg border border-emerald-500/30 text-center">
                      <p className="text-sm text-muted-foreground">Todo el inventario está bien</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

        </div>
        </>
      )}
    </main>
  )
}
