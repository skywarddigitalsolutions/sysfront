import { EventStatistics, MenuItem, Order, User } from '@/lib/types'

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
export async function fetchUsers(isActive?: boolean): Promise<User[]> {
  const url = isActive !== undefined ? `/api/users?isActive=${isActive}` : '/api/users'
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al obtener usuarios')
  }
  return response.json()
}

export async function fetchAvailableRoles(): Promise<{ id: string; name: string }[]> {
  const response = await fetch('/api/roles')
  if (!response.ok) {
    throw new Error('Error al obtener roles')
  }
  return response.json()
}

export async function createUser(data: { userName: string; password: string; roleId: string }): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error al crear usuario')
  }
  return response.json()
}

export async function activateUser(userId: string): Promise<void> {
  const response = await fetch(`/api/users/${userId}/activate`, {
    method: 'PATCH',
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error al activar usuario')
  }
}

export async function deactivateUser(userId: string): Promise<void> {
  const response = await fetch(`/api/users/${userId}/deactivate`, {
    method: 'PATCH',
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error al desactivar usuario')
  }
}

export async function resetUserPassword(userId: string, password: string): Promise<void> {
  const response = await fetch(`/api/users/${userId}/reset-password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword: password }),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error al blanquear contraseña')
  }
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
