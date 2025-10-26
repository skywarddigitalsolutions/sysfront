'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Event, MenuItem } from '@/lib/types'
import { fetchEvents, fetchMenuItems, deleteMenuItem, updateMenuItemInfo } from '@/lib/api/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function EventList() {
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: events, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

  const { data: menuItems, isLoading: isLoadingMenuItems } = useQuery<MenuItem[]>({
    queryKey: ['menuItems', selectedEventId],
    queryFn: () => fetchMenuItems(selectedEventId),
    enabled: !!selectedEventId,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', selectedEventId] })
      setItemToDelete(null)
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateMenuItemInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', selectedEventId] })
      setIsUpdateModalOpen(false)
    },
  })

  const handleDelete = (itemId: string) => {
    setItemToDelete(itemId)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete)
    }
  }

  const handleUpdate = (item: MenuItem) => {
    setSelectedItem(item)
    setIsUpdateModalOpen(true)
  }

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItem) {
      updateMutation.mutate(selectedItem)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un evento para ver sus ítems" />
            </SelectTrigger>
            <SelectContent>
              {events?.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoadingEvents ? (
            <p>Cargando eventos...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{event.description}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <Card>
          <CardHeader>
            <CardTitle>Ítems del Menú para el Evento Seleccionado</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMenuItems ? (
              <p>Cargando ítems del menú...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Valor Invertido</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>${item?.realPrice?.toFixed(2)}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleUpdate(item)} className="mr-2">
                          Actualizar
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el ítem del menú.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Ítem del Menú</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={selectedItem?.name || ''}
                onChange={(e) => setSelectedItem(prev => prev ? {...prev, name: e.target.value} : null)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={selectedItem?.description || ''}
                onChange={(e) => setSelectedItem(prev => prev ? {...prev, description: e.target.value} : null)}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={selectedItem?.price || ''}
                onChange={(e) => setSelectedItem(prev => prev ? {...prev, price: parseFloat(e.target.value)} : null)}
                required
              />
            </div>
            <div>
              <Label htmlFor="realPrice">Valor Invertido</Label>
              <Input
                id="realPrice"
                type="number"
                step="0.01"
                value={selectedItem?.realPrice || ''}
                onChange={(e) => setSelectedItem(prev => prev ? {...prev, realPrice: parseFloat(e.target.value)} : null)}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={selectedItem?.stock || ''}
                onChange={(e) => setSelectedItem(prev => prev ? {...prev, stock: parseInt(e.target.value)} : null)}
                required
              />
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}