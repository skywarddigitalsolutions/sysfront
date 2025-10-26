import { Event, EventStatistics, MenuItem, Order, User } from '@/lib/types'

// Funciones para eventos
export async function fetchEvents(): Promise<Event[]> {
  const response = await fetch('/api/events')
  if (!response.ok) {
    throw new Error('Error al obtener eventos')
  }
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

// Funciones para menú items
export async function fetchMenuItems(eventId: string): Promise<MenuItem[]> {
  const response = await fetch(`/api/menu-items?eventId=${eventId}`)
  if (!response.ok) {
    throw new Error('Error al obtener items del menú')
  }
  return response.json()
}

export async function createMenuItem(data: { name: string; description: string; price: number; stock: number; eventId: string, totalInvestment: number }): Promise<MenuItem> {
  const response = await fetch('/api/menu-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Error al crear item del menú')
  }
  return response.json()
}

export async function deleteMenuItem(id: string): Promise<void> {
  const response = await fetch(`/api/menu-items?id=${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Error al eliminar item del menú')
  }
}

export async function updateMenuItemInfo(item: MenuItem): Promise<MenuItem> {
  const response = await fetch(`/api/menu-items?id=${item.id}&info=true`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    throw new Error('Failed to update menu item');
  }
  return response.json();
}


// Funciones para usuarios
export async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users')
  if (!response.ok) {
    throw new Error('Error al obtener usuarios')
  }
  return response.json()
}

export async function createUser(data: { username: string; password: string; role: 'ADMIN' | 'CAJA' | 'COCINA' }): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Error al crear usuario')
  }
  return response.json()
}

// Funciones para órdenes
export async function fetchOrders(eventId: string): Promise<Order[]> {
  const response = await fetch(`/api/orders?eventId=${eventId}`)
  if (!response.ok) {
    throw new Error('Error al obtener órdenes')
  }
  return response.json()
}

export async function createOrder(data: {
  userId: string;
  eventId: string;
  items: { menuItemId: string; quantity: number }[];
  customerIdentifier: string;
}): Promise<Order> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Error al crear orden')
  }
  return response.json()
}

export async function updateOrderStatus(data: { orderId: string; status: 'PENDIENTE' | 'EN_PREPARACION' | 'COMPLETADO' }): Promise<Order> {
  const response = await fetch("/api/orders", {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: data.status,
      orderId: data.orderId
    }),
  })
  if (!response.ok) {
    throw new Error('Error al actualizar estado de la orden')
  }
  return response.json()
}

export async function deleteOrder(orderId: string): Promise<void> {
  const response = await fetch(`/api/orders?id=${orderId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Error al eliminar orden')
  }
}

export async function fetchEventStatistics(eventId: string): Promise<EventStatistics> {
  const response = await fetch(`/api/events?eventId=${eventId}&statistics=true`)
  if (!response.ok) {
    throw new Error('Error al obtener estadísticas de órdenes')
  }
  return response.json()
}