"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Order, Event, Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fetchEvents } from "@/lib/api/events/api"
import { fetchOrders, updateOrderStatus, fetchProducts } from "@/lib/api/api"
import { Clock, ChefHat, CheckCircle2, AlertTriangle, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusPill } from "@/components/Status-pill"

function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onStatusChange,
}: {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (orderId: string, status: Order["status"]) => void
}) {
  if (!order) return null

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return { label: "Pendiente", color: "bg-red-500", icon: Clock }
      case "in_progress":
        return { label: "En Preparación", color: "bg-yellow-500", icon: ChefHat }
      case "completed":
        return { label: "Completado", color: "bg-green-500", icon: CheckCircle2 }
      case "delivered":
        return { label: "Entregado", color: "bg-blue-500", icon: Package }
    }
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            Pedido #{order.id.slice(0, 8)}
            <Badge className={cn("text-white", statusInfo.color)}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {statusInfo.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Cliente: {order.customerName || "Sin nombre"} | {new Date(order.createdAt).toLocaleString("es-AR")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-lg">Items del Pedido</h3>
            {order.items.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="flex justify-between items-center py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-semibold">${item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-[#1E2C6D]">${order.total}</span>
          </div>

          <div className="flex gap-2">
            {order.status === "pending" && (
              <Button
                onClick={() => {
                  onStatusChange(order.id, "in_progress")
                  onClose()
                }}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Iniciar Preparación
              </Button>
            )}
            {order.status === "in_progress" && (
              <Button
                onClick={() => {
                  onStatusChange(order.id, "completed")
                  onClose()
                }}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar Completado
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function OrderCard({
  order,
  onStatusChange,
  onClick,
}: {
  order: Order
  onStatusChange: (orderId: string, status: Order["status"]) => void
  onClick: () => void
}) {
  const getStatusConfig = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return {
          bgColor: "bg-red-950/20",
          borderColor: "border-l-red-500",
          icon: Clock,
          actionLabel: "Iniciar",
          actionColor: "bg-yellow-500 hover:bg-yellow-600",
          nextStatus: "in_progress" as const,
        }
      case "in_progress":
        return {
          bgColor: "bg-yellow-950/20",
          borderColor: "border-l-yellow-500",
          icon: ChefHat,
          actionLabel: "Completar",
          actionColor: "bg-green-500 hover:bg-green-600",
          nextStatus: "completed" as const,
        }
      case "completed":
        return {
          bgColor: "bg-green-950/20",
          borderColor: "border-l-green-500",
          icon: CheckCircle2,
          actionLabel: null,
          actionColor: "",
          nextStatus: null,
        }
      case "delivered":
        return {
          bgColor: "bg-blue-950/20",
          borderColor: "border-l-blue-500",
          icon: Package,
          actionLabel: null,
          actionColor: "",
          nextStatus: null,
        }
    }
  }

  const config = getStatusConfig(order.status)
  const StatusIcon = config.icon

  return (
    <Card
      className={cn("border-l-4 transition-all hover:shadow-lg cursor-pointer", config.bgColor, config.borderColor)}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-[#1E2C6D] mb-1">Pedido #{order.id.slice(0, 8)}</h3>
            <p className="text-sm text-muted-foreground">{order.customerName || "Cliente sin nombre"}</p>
          </div>
          <StatusPill status={order.status} />
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item, idx) => (
            <div key={`${order.id}-${item.productId}-${idx}`} className="flex justify-between text-sm">
              <span className="font-medium">
                {item.quantity}x {item.productName}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-lg font-bold">
            Total: <span className="text-[#1E2C6D]">${order.total}</span>
          </div>
          {config.actionLabel && config.nextStatus && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange(order.id, config.nextStatus!)
              }}
              className={cn("text-white", config.actionColor)}
            >
              {config.actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CocinaDashboard() {
  const [selectedEventId, setSelectedEventId] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const queryClient = useQueryClient()

  const { data: events } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: fetchEvents,
  })

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products", selectedEventId],
    queryFn: () => fetchProducts(selectedEventId),
    enabled: !!selectedEventId,
  })

  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id)
    }
  }, [events, selectedEventId])

  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["orders", selectedEventId],
    queryFn: () => fetchOrders(selectedEventId),
    enabled: !!selectedEventId,
    refetchInterval: 5000, // Actualizar cada 5 segundos
  })

  const mutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", selectedEventId] })
    },
  })

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    mutation.mutate({ orderId, status: newStatus })
  }

  const pendingOrders = orders?.filter((o) => o.status === "pending") || []
  const inProgressOrders = orders?.filter((o) => o.status === "in_progress") || []
  const completedOrders = orders?.filter((o) => o.status === "completed") || []
  const deliveredOrders = orders?.filter((o) => o.status === "delivered") || []

  const lowStockProducts = products?.filter((p) => p.stock > 0 && p.stock <= 5) || []
  const outOfStockProducts = products?.filter((p) => p.stock === 0) || []

  return (
    <div className="min-h-screenbg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E2C6D] mb-2">Panel de Cocina</h1>
            <p className="text-muted-foreground">Gestiona los pedidos en tiempo real</p>
          </div>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[250px]">
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

        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <Card className="border-l-4 border-l-orange-500 bg-orange-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-400 mb-2">Alertas de Inventario</h3>
                  {outOfStockProducts.length > 0 && (
                    <p className="text-sm text-orange-300 mb-1">
                      <span className="font-medium">Sin stock:</span> {outOfStockProducts.map((p) => p.name).join(", ")}
                    </p>
                  )}
                  {lowStockProducts.length > 0 && (
                    <p className="text-sm text-orange-300">
                      <span className="font-medium">Stock bajo:</span>{" "}
                      {lowStockProducts.map((p) => `${p.name} (${p.stock})`).join(", ")}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="text-orange-600 border-orange-600 bg-transparent">
                  Ver Inventario
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">No Preparados</p>
                  <p className="text-3xl font-bold text-red-600">{pendingOrders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-950 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">En Preparación</p>
                  <p className="text-3xl font-bold text-yellow-600">{inProgressOrders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-950 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Listos</p>
                  <p className="text-3xl font-bold text-green-600">{completedOrders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-950 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Entregados</p>
                  <p className="text-3xl font-bold text-blue-600">{deliveredOrders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-950 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedEventId && (
          <div className="space-y-6">
            {isLoadingOrders ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E2C6D] mx-auto"></div>
                <p className="text-muted-foreground mt-4">Cargando pedidos...</p>
              </div>
            ) : orders && orders.length > 0 ? (
              <>
                {/* Pendientes */}
                {pendingOrders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      No Preparados ({pendingOrders.length})
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {pendingOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onStatusChange={handleStatusChange}
                          onClick={() => setSelectedOrder(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* En Preparación */}
                {inProgressOrders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-yellow-600 mb-4 flex items-center gap-2">
                      <ChefHat className="h-5 w-5" />
                      En Preparación ({inProgressOrders.length})
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {inProgressOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onStatusChange={handleStatusChange}
                          onClick={() => setSelectedOrder(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completados */}
                {completedOrders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Listos para Retirar ({completedOrders.length})
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {completedOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onStatusChange={handleStatusChange}
                          onClick={() => setSelectedOrder(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay pedidos</h3>
                  <p className="text-muted-foreground">Los pedidos aparecerán aquí cuando se realicen</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  )
}
