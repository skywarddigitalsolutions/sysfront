'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Order, Event } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  fetchEvents,
  fetchOrders,
} from '@/lib/api/api'
import { useAuth } from './AuthContext'
import { OrderSheet } from './caja/order-sheet'
import { Eye } from 'lucide-react'
import { OrderDetailsModal } from './caja/order-details'
import { StatusPill } from './status-pill'

export default function CajaDashboard() {
  const [selectedEventId, setSelectedEventId] = useState('')
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { user } = useAuth()
  
  const { data: events } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['orders', selectedEventId],
    queryFn: () => fetchOrders(selectedEventId),
    enabled: !!selectedEventId,
    refetchInterval: 10000,
  })

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order)
  }


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel de Caja</h1>

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
        <>
          <Button onClick={() => setIsOrderSheetOpen(true)}>Realizar Pedido</Button>
          
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
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.customerIdentifier}</TableCell>
                        <TableCell>
                          ${order.items.reduce((total, item) => total + item.menuItem?.price * item?.quantity, 0).toFixed(2)}
                        </TableCell>
                        <TableCell><StatusPill status={order.status} /></TableCell>
                        <TableCell>
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
        </>
      )}

      {user && (
        <OrderSheet
          isOpen={isOrderSheetOpen}
          onClose={() => setIsOrderSheetOpen(false)}
          eventId={selectedEventId}
          userId={user.id}
        />
      )}

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}
