"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusPill } from "@/components/status-pill"
import { Edit, Trash2 } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  customizations?: string[]
}

interface Order {
  id: string
  orderNumber: string
  customerIdentifier: string
  status: "PENDIENTE" | "EN_PREPARACION" | "COMPLETADO"
  items: OrderItem[]
  total: number
  createdAt: string
  specialRequests?: string
}

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onStatusChange?: (status: "PENDIENTE" | "EN_PREPARACION" | "COMPLETADO") => void
  onDelete?: () => void
}

export function OrderDetailsModal({ order, isOpen, onClose, onStatusChange, onDelete }: OrderDetailsModalProps) {
  if (!order) return null

  const handleStatusChange = (newStatus: "PENDIENTE" | "EN_PREPARACION" | "COMPLETADO") => {
    onStatusChange?.(newStatus)
  }

  const handleDelete = () => {
    onDelete?.()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black border border-white/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-white">Detalles del Pedido</DialogTitle>
              <p className="text-white/60 text-sm mt-1">Orden #{order.orderNumber}</p>
            </div>
          </div>
          <StatusPill status={order.status} />
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4">
          {/* Cliente */}
          <Card className="bg-white/5 border-white/20">
            <CardContent className="pt-6">
              <p className="text-white/80">
                <span className="text-white/60 text-sm">Cliente:</span>{" "}
                <span className="font-semibold text-white text-lg">{order.customerIdentifier}</span>
              </p>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="bg-white/5 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Artículos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.name}</p>
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="bg-[#1E2C6D]/20 border border-[#1E2C6D]/50 rounded mt-2 p-2">
                        <p className="text-xs text-[#1E2C6D] font-semibold mb-1">Personalizaciones:</p>
                        <ul className="text-xs text-white/70 space-y-1">
                          {item.customizations.map((custom, idx) => (
                            <li key={idx}>• {custom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-white/80 text-sm">x{item.quantity}</p>
                    <p className="text-[#D9251C] font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-[#1E2C6D]/20 to-[#D9251C]/20 border border-white/20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-white/80 font-medium">Total:</span>
              <span className="text-[#D9251C] font-bold text-2xl">${(order.total * 1.1).toFixed(2)}</span>
            </div>
          </div>

          {/* Solicitudes Especiales */}
          {order.specialRequests && (
            <Card className="bg-orange-500/10 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-sm text-orange-400">Solicitudes Especiales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-sm">{order.specialRequests}</p>
              </CardContent>
            </Card>
          )}

          {/* Status Change Buttons */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-xs text-white/60 font-semibold uppercase">Cambiar Estado:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => handleStatusChange("PENDIENTE")}
                variant={order.status === "PENDIENTE" ? "default" : "outline"}
                size="sm"
                className={
                  order.status === "PENDIENTE"
                    ? "bg-[#1E2C6D] hover:bg-[#1E2C6D]"
                    : "border-white/20 text-white/80 hover:bg-white/10"
                }
              >
                Pendiente
              </Button>
              <Button
                onClick={() => handleStatusChange("EN_PREPARACION")}
                variant={order.status === "EN_PREPARACION" ? "default" : "outline"}
                size="sm"
                className={
                  order.status === "EN_PREPARACION"
                    ? "bg-[#D9251C] hover:bg-[#D9251C]"
                    : "border-white/20 text-white/80 hover:bg-white/10"
                }
              >
                En Prep.
              </Button>
              <Button
                onClick={() => handleStatusChange("COMPLETADO")}
                variant={order.status === "COMPLETADO" ? "default" : "outline"}
                size="sm"
                className={
                  order.status === "COMPLETADO"
                    ? "bg-green-600 hover:bg-green-600"
                    : "border-white/20 text-white/80 hover:bg-white/10"
                }
              >
                Completado
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <Button className="w-full bg-gradient-to-r from-[#1E2C6D] to-[#2a3d8f] hover:from-[#1E2C6D] hover:to-[#1E2C6D] text-white font-bold">
              <Edit className="mr-2 h-4 w-4" />
              Modificar Pedido
            </Button>

            <Button
              onClick={handleDelete}
              variant="outline"
              className="w-full border-[#D9251C] text-[#D9251C] hover:bg-[#D9251C]/10 bg-transparent"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Pedido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
