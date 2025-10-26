'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchEvents, fetchEventStatistics } from '@/lib/api/api'
import { Event, EventStatistics } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Bar, BarChart, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Tooltip } from './ui/tooltip'
import { ArrowDownRight, ArrowUpRight, DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [selectedEventId, setSelectedEventId] = useState<string>('')

  const { data: events } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) setSelectedEventId(events[0].id);
  }, [events, selectedEventId])

  const { data: statistics } = useQuery<EventStatistics>({
    queryKey: ['eventStatistics', selectedEventId],
    queryFn: () => fetchEventStatistics(selectedEventId),
    enabled: !!selectedEventId,
  })

  const chartData = statistics ?
    Object.entries(statistics.topSellingItems)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5) : []

  const profit = statistics ? statistics.totalRevenue - statistics.totalInvestment : 0
  const profitPercentage = statistics && statistics.totalInvestment > 0
    ? ((profit / statistics.totalInvestment) * 100).toFixed(2)
    : '0.00'

  //TODO: Esto deberia reemplazarse cuando implemente JWT.
  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/login')
    } else {
      setIsLoading(false)
    }
  }, [user, isLoading])

  if (isLoading || !user) return null

  return (
    <main className="flex-1 p-6 space-y-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Bienvenido, {user.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">Rol: {user.role}</p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Estadísticas del Evento</h1>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecciona un evento" />
            </SelectTrigger>
            <SelectContent>
              {events?.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {statistics && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    +{statistics.pendingOrders} pendientes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${statistics.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    ${statistics.averageOrderValue.toFixed(2)} promedio por pedido
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inversión Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${statistics.totalInvestment.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Costo de productos vendidos
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ganancia</CardTitle>
                  {profit >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${profit.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {profit >= 0 ? '+' : ''}{profitPercentage}% del costo
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Ítems Más Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" fill="#8884d8" name="Cantidad Vendida" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Detalles Adicionales</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <dl className="divide-y divide-gray-100">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6">Ítem Más Vendido</dt>
                      <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">{statistics.topSellingItem}</dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6">Pedidos Completados</dt>
                      <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">{statistics.completedOrders}</dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6">Pedidos en Preparación</dt>
                      <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">{statistics.inProgressOrders}</dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6">Pedidos Pendientes</dt>
                      <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">{statistics.pendingOrders}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
