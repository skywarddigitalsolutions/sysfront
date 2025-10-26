'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Order, Event } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  fetchEvents,
  fetchOrders,
  updateOrderStatus
} from '@/lib/api/api'
import { OrderDetailsModal } from './caja/order-details'
import { Eye } from 'lucide-react'
import { StatusPill } from './status-pill'

export default function CocinaDashboard() {
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const queryClient = useQueryClient()

  const { data: events } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

  useEffect(() => {
      if (events && events.length > 0 && !selectedEventId) setSelectedEventId(events[0].id);
  }, [events, selectedEventId])

  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['orders', selectedEventId],
    queryFn: () => fetchOrders(selectedEventId),
    enabled: !!selectedEventId,
    refetchInterval: 10000,
  })

  const mutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', selectedEventId] })
    },
  })

  const handleStatusChange = (orderId: string, newStatus: 'PENDIENTE' | 'EN_PREPARACION' | 'COMPLETADO') => {
    mutation.mutate({ orderId, status: newStatus })
  }

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel de Cocina</h1>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger>
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
        </CardContent>
      </Card>

      {selectedEventId && (
        <Card>
          <CardHeader>
            <CardTitle>Pedidos del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <p>Cargando pedidos...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.customerIdentifier}</TableCell>
                      <TableCell>
                        <StatusPill status={order.status} />
                      </TableCell>
                      <TableCell className="space-x-2 flex items-center">
                        {order.status === 'PENDIENTE' && (
                          <Button onClick={() => handleStatusChange(order.id, 'EN_PREPARACION')} size="sm">
                            Iniciar Preparación
                          </Button>
                        )}
                        {order.status === 'EN_PREPARACION' && (
                          <Button onClick={() => handleStatusChange(order.id, 'COMPLETADO')} size="sm">
                            Marcar como Completado
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}
