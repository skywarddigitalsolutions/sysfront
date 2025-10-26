import { createEvent, getEvents, getEventStatistics } from '@/data/events'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  if (eventId) {
    if (searchParams.get('statistics')) {
      try {
        const statistics = await getEventStatistics(eventId)
        return NextResponse.json(statistics)
      } catch {
        return NextResponse.json({ message: 'Error al obtener estadísticas' }, { status: 500 })
      }
    }
  }

  try {
    const events = await getEvents()
    return NextResponse.json(events)
  } catch {
    return NextResponse.json({ message: 'Error al obtener eventos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, date } = await request.json()
    const newEvent = await createEvent(name, description, new Date(date))
    return NextResponse.json(newEvent, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Error al crear evento' }, { status: 500 })
  }
}

