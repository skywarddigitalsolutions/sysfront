import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { fetchMenuItems, createOrder } from '@/lib/api/api'
import { MenuItem } from '@/lib/types'
import { toast } from '@/hooks/use-toast'

interface OrderSheetProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  userId: string
}

export function OrderSheet({ isOpen, onClose, eventId, userId }: OrderSheetProps) {
  const [orderItems, setOrderItems] = useState<{ [key: string]: number }>({})
  const [customerIdentifier, setCustomerIdentifier] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const queryClient = useQueryClient()

  const { data: menuItems, isLoading: isLoadingMenuItems, error: menuItemsError } = useQuery<MenuItem[]>({
    queryKey: ['menuItems', eventId],
    queryFn: () => fetchMenuItems(eventId),
    enabled: !!eventId,
  })

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', eventId] });
      queryClient.invalidateQueries({ queryKey: ['orders', eventId] })
      setOrderItems({})
      setCustomerIdentifier('')
      toast({
        title: "Pedido creado",
        description: "El pedido se ha creado exitosamente.",
      })
      onClose()
    },
    onError: (error) => {
      console.error('Error al crear el pedido:', error)
      toast({
        title: "Error",
        description: "Hubo un problema al crear el pedido. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    }
  })

  const handleQuantityChange = (menuItemId: string, quantity: number) => {
    setOrderItems(prev => ({
      ...prev,
      [menuItemId]: quantity
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const items = Object.entries(orderItems)
      .filter(([, quantity]) => quantity > 0)
      .map(([menuItemId, quantity]) => ({ menuItemId, quantity }))
    if (items.length > 0) {
      setShowConfirmDialog(true)
    } else {
      toast({
        title: "Error",
        description: "Por favor, seleccione al menos un ítem para el pedido.",
        variant: "destructive",
      })
    }
  }

  const confirmOrder = () => {
    const items = Object.entries(orderItems)
      .filter(([, quantity]) => quantity > 0)
      .map(([menuItemId, quantity]) => ({ menuItemId, quantity }))
  
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, seleccione al menos un ítem para el pedido.",
        variant: "destructive",
      })
      return
    }
  
    if (!customerIdentifier.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingrese un identificador de cliente válido.",
        variant: "destructive",
      })
      return
    }
  
    mutation.mutateAsync({ userId, eventId, items, customerIdentifier })
    setShowConfirmDialog(false)
  }

  const clearOrder = () => {
    setOrderItems({})
    setCustomerIdentifier('')
  }

  const totalPrice = menuItems?.reduce((total, item) => {
    return total + (item.price * (orderItems[item.id] || 0));
  }, 0) || 0;

  if (menuItemsError) {
    return <p>Error al cargar el menú. Por favor, intente de nuevo.</p>
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Realizar Pedido</SheetTitle>
          <SheetDescription>Ingrese los detalles del pedido aquí.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customerIdentifier">Identificador del Cliente</Label>
            <Input
              id="customerIdentifier"
              value={customerIdentifier}
              onChange={(e) => setCustomerIdentifier(e.target.value)}
              placeholder="Ej: Mesa 5, Juan Pérez, etc."
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          {isLoadingMenuItems ? (
            <p>Cargando menú...</p>
          ) : menuItems && menuItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ítem</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={item.stock}
                        value={orderItems[item.id] || 0}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(parseInt(e.target.value) || 0, item.stock));
                          handleQuantityChange(item.id, value);
                        }}
                        className="w-20"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No hay ítems en el menú.</p>
          )}
          <div className="py-4">
            <strong>Total: ${totalPrice.toFixed(2)}</strong>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enviando...' : 'Enviar Pedido'}
            </Button>
            <Button variant="outline" onClick={clearOrder}>
              Limpiar Pedido
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pedido</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea enviar este pedido?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmOrder}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}