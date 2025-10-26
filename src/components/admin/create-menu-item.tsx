'use client'

import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createMenuItem, fetchEvents } from '@/lib/api/api'
import { Event } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CreateMenuItem() {
  const [menuItemName, setMenuItemName] = useState('')
  const [menuItemDescription, setMenuItemDescription] = useState('')
  const [menuItemPrice, setMenuItemPrice] = useState('')
  const [totalInvestment, setTotalInvestment] = useState('')
  const [menuItemStock, setMenuItemStock] = useState('')
  const [selectedEventId, setSelectedEventId] = useState('')
  const queryClient = useQueryClient()

  const { data: events } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

  const menuItemMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', selectedEventId] })
      setMenuItemName('')
      setMenuItemDescription('')
      setMenuItemPrice('')
      setMenuItemStock('')
    },
  })

  const handleMenuItemSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedEventId) {
      menuItemMutation.mutate({
        name: menuItemName,
        description: menuItemDescription,
        price: parseFloat(menuItemPrice),
        stock: parseInt(menuItemStock),
        eventId: selectedEventId,
        totalInvestment: parseFloat(totalInvestment),
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Ítem del Menú</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMenuItemSubmit} className="space-y-4">
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
          <Input
            type="text"
            value={menuItemName}
            onChange={(e) => setMenuItemName(e.target.value)}
            placeholder="Nombre del ítem"
            required
          />
          <Textarea
            value={menuItemDescription}
            onChange={(e) => setMenuItemDescription(e.target.value)}
            placeholder="Descripción del ítem"
            required
          />
          <Input
            type="number"
            value={menuItemPrice}
            onChange={(e) => setMenuItemPrice(e.target.value)}
            placeholder="Precio"
            required
            step="0.01"
          />
          <Input
            type="number"
            value={totalInvestment}
            onChange={(e) => setTotalInvestment(e.target.value)}
            placeholder="Valor invertido total"
            required
          />
          <Input
            type="number"
            value={menuItemStock}
            onChange={(e) => setMenuItemStock(e.target.value)}
            placeholder="Stock"
            required
          />
          <Button type="submit" disabled={menuItemMutation.isPending || !selectedEventId}>
            {menuItemMutation.isPending ? 'Creando...' : 'Crear Ítem del Menú'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
