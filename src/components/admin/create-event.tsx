'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEvent } from '@/lib/api/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function CreateEvent() {
  const [eventName, setEventName] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const queryClient = useQueryClient()

  const eventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setEventName('')
      setEventDescription('')
      setEventDate('')
    },
  })

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    eventMutation.mutate({ name: eventName, description: eventDescription, date: eventDate })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Evento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEventSubmit} className="space-y-4">
          <Input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Nombre del evento"
            required
          />
          <Textarea
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Descripción del evento"
            required
          />
          <Input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
          <Button type="submit" disabled={eventMutation.isPending}>
            {eventMutation.isPending ? 'Creando...' : 'Crear Evento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}