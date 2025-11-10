import { Event } from '@/lib/types'

/**
 * Obtiene todos los eventos
 * @returns Array de eventos
 */
export async function fetchEvents(): Promise<Event[]> {
  const response = await fetch('/api/events');
  if (!response.ok) throw new Error('Error al obtener eventos');
  return response.json();
}

/**
 * Crea un nuevo evento
 * @param data Datos del evento
 * @returns Evento creado
 */
export async function createEvent(data: { name: string; description: string; date: string }): Promise<Event> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Error al crear evento');
  return response.json();
}

/**
 * Obtiene las estadísticas de un evento
 * @param eventId ID del evento
 * @returns Estadísticas del evento
 */
export async function fetchEventStatistics(eventId: string): Promise<EventStatistics> {
  const response = await fetch(`/api/events?eventId=${eventId}&statistics=true`)
  if (!response.ok) throw new Error('Error al obtener estadísticas de órdenes');
  return response.json()
}