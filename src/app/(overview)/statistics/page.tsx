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
import { ArrowDownRight, ArrowUpRight, DollarSign, Package, ShoppingCart, TrendingUp, AlertCircle, RotateCcw, ArrowDownLeftIcon } from "lucide-react"

export default function statistics() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [sortBy, setSortBy] = useState<"quantity" | "name">("quantity")
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
      .sort((a, b) => (sortBy === "quantity" ? b.quantity - a.quantity : a.name.localeCompare(b.name)))
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
        <p className="text-muted-foreground">
          Bienvenido {user.username}, aquí puedes ver el análisis detallado de tus eventos
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="space-y-2">
          <label className="text-sm font-medium">Selecciona un evento</label>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-full md:w-[300px] bg-card border-border">
              <SelectValue placeholder="Selecciona un evento" />
            </SelectTrigger>
            <SelectContent>
              {events?.map((event) => (
                <SelectItem key={event.id} value={event.id}>
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
            <Card className="border border-white-1 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pedidos</CardTitle>
                <ShoppingCart className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{statistics.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">+{statistics.pendingOrders} pendientes</p>
              </CardContent>
            </Card>

            {/* Inversión */}
            <Card className="border border-white-1 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
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
            <Card className="border border-white-1 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos</CardTitle>
                <DollarSign className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">${statistics.totalRevenue.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${statistics.averageOrderValue.toFixed(2)} promedio
                </p>
              </CardContent>
            </Card>

            {/* Costos */}
            <Card className="border border-white-1 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Costos</CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">${statistics.totalInvestment.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Total de gastos</p>
              </CardContent>
            </Card>

            {/* Ganancia */}
            <Card
              className={`border border-white-1 ${profit >= 0 ? "bg-gradient-to-br from-green-950/40 to-green-950/20" : "bg-gradient-to-br from-red-950/40 to-red-950/20"} hover:shadow-lg transition-shadow`}
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
                <CardTitle className="text-lg">Top Ítems Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#ffffff" />
                    <YAxis stroke="#ffffff" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#1E2C6D", border: "2px solid #ffffff" }}
                      cursor={{ fill: "rgba(29, 44, 109, 0.1)" }}
                      labelStyle={{ color: "#ffffff" }}
                    />
                    <Bar dataKey="quantity" fill="#1E2C6D" name="Cantidad Vendida" radius={[8, 8, 0, 0]} />
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
                    className="flex-1 px-3 py-2 bg-input border border-white-1 rounded-md text-sm text-foreground placeholder-muted-foreground"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "quantity" | "name")}
                    className="px-3 py-2 bg-input border border-white-1 rounded-md text-sm text-foreground"
                  >
                    <option value="quantity">Cantidad (Mayor a Menor)</option>
                    <option value="name">Nombre (A-Z)</option>
                  </select>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredAndSortedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-input rounded-lg border border-white-1 hover:border-primary transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <span className="text-sm font-bold text-white bg-primary px-3 py-1 rounded-full">
                        {item.quantity} vendidos
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sobrante del Evento */}
            <Card className="border border-white-1 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Sobrante del Evento</CardTitle>
                <RotateCcw className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div>
                    <p className="text-sm text-muted-foreground">Ítems sin vender</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{itemsRemaining}</p>
                  </div>
                  <Package className="h-12 w-12 text-primary/40" />
                </div>
              </CardContent>
            </Card>

            {/* Alertas de Stock */}
            <Card className="border border-white-1 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Falta de Stock</CardTitle>
                <AlertCircle className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stockAlerts.length > 0 ? (
                    stockAlerts.map((alert, idx) => (
                      <div key={idx} className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-foreground">{alert.product}</p>
                          <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">¡Bajo!</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Actual: <span className="text-accent font-bold">{alert.current}</span> / Mínimo:{" "}
                          <span className="font-bold">{alert.minimum}</span>
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
