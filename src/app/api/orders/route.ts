import { getMenuItem, updateMenuItem } from '@/models/menu-items'
import { createOrder, deleteOrder, getOrders, updateOrderStatus } from '@/models/orders'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')
  if (!eventId) {
    return NextResponse.json({ message: 'EventId is required' }, { status: 400 })
  }
  try {
    const orders = await getOrders(eventId)
    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ message: 'Error al obtener órdenes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const res = await request.json()
    const { userId, eventId, items, customerIdentifier } = res

    for (const item of items) {
      const idItem = await getMenuItem(item.menuItemId);
      updateMenuItem(idItem[0].id, { stock: idItem[0].stock - item.quantity });
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ message: 'userId inválido o faltante' }, { status: 400 })
    }
    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ message: 'eventId inválido o faltante' }, { status: 400 })
    }
    if (!customerIdentifier || typeof customerIdentifier !== 'string') {
      return NextResponse.json({ message: 'customerIdentifier inválido o faltante' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'items debe ser un array no vacío' }, { status: 400 })
    }

    // Validación de cada item
    for (const item of items) {
      if (!item.menuItemId || typeof item.menuItemId !== 'string') {
        return NextResponse.json({ message: 'menuItemId inválido en items' }, { status: 400 })
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ message: 'quantity debe ser un número entero positivo' }, { status: 400 })
      }
    }

    const newOrder = await createOrder(userId, eventId, customerIdentifier, items)
    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/orders:', error)
    return NextResponse.json(
      { message: 'Error al crear orden', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { orderId, status } = await request.json()

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ message: 'Invalid orderId' }, { status: 400 })
    }

    if (!['PENDIENTE', 'EN_PREPARACION', 'COMPLETADO'].includes(status)) {
      return NextResponse.json({ message: 'Estado de orden inválido' }, { status: 400 })
    }

    const updatedOrder = await updateOrderStatus(orderId, status as 'PENDIENTE' | 'EN_PREPARACION' | 'COMPLETADO')
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error in PUT /api/orders:', error)
    return NextResponse.json(
      { message: 'Error al actualizar estado de la orden', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'Invalid orderId' }, { status: 400 })
    }
    await deleteOrder(id)
    return NextResponse.json({ message: 'Order deleted' })
  } catch (error) {
    console.error('Error in DELETE /api/orders:', error)
    return NextResponse.json(
      { message: 'Error al eliminar orden', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
