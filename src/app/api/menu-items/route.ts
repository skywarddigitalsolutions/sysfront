import { NextResponse } from 'next/server'
import { createMenuItem, deleteMenuItem, getMenuItems, updateMenuItem } from '../../../data/menu-items'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  if (!eventId) {
    return NextResponse.json({ message: 'EventId is required' }, { status: 400 })
  }

  try {
    const menuItems = await getMenuItems(eventId)
    return NextResponse.json(menuItems)
  } catch {
    return NextResponse.json({ message: 'Error al obtener ítems del menú' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const newMenuItem = await createMenuItem(data)
    return NextResponse.json(newMenuItem, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Error al crear ítem del menú' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ message: 'Id is required' }, { status: 400 })
  }

  if (searchParams.get('info')) {
    try {
      const data = await request.json()
      const updatedMenuItem = await updateMenuItem(id, {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        realPrice: data.realPrice,
      })
      return NextResponse.json(updatedMenuItem)
    } catch {
      return NextResponse.json({ message: 'Error al actualizar información de ítem del menú' }, { status: 500 })
    }
  }

  try {
    const data = await request.json()
    const updatedMenuItem = await updateMenuItem(id, data)
    return NextResponse.json(updatedMenuItem)
  } catch {
    return NextResponse.json({ message: 'Error al actualizar ítem del menú' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ message: 'Id is required' }, { status: 400 })
  }

  try {
    const deletedMenuItem = await deleteMenuItem(id)
    return NextResponse.json(deletedMenuItem)
  } catch {
    return NextResponse.json({ message: 'Error al eliminar ítem del menú' }, { status: 500 })
  }
}
