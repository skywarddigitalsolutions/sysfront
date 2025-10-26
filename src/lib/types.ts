export interface User {
  id: string
  username: string
  role: 'ADMIN' | 'CAJA' | 'COCINA'
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
}

export interface OrderItem {
  id: string
  quantity: number
  menuItem: Product
}

export interface Order {
  id: string
  createdAt: Date
  updatedAt: Date
  status: 'PENDIENTE' | 'EN_PREPARACION' | 'COMPLETADO'
  userId: string
  eventId: string
  customerIdentifier: string
  items: OrderItem[]
}

export interface Event {
  id: string
  name: string
  description: string
  date: Date
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  stock: number
  eventId: string
  event: {
    name: string
  }
  realPrice: number
}

export interface EventStatistics {
  totalOrders: number
  totalRevenue: number
  totalInvestment: number
  pendingOrders: number
  inProgressOrders: number
  completedOrders: number
  topSellingItem: string
  topSellingItems: Record<string, number>
  averageOrderValue: number
}
