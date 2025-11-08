import { Event } from '@/lib/types'

export async function fetchEvents(): Promise<Event[]> {
  const response = await fetch('/api/events')
  if (!response.ok) throw new Error('Error al obtener eventos')
  return response.json()
}

export async function createEvent(data: { name: string; description: string; date: string }): Promise<Event> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Error al crear evento')
  }
  return response.json()
}