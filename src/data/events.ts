import { Event } from '@prisma/client'
import prisma from '../lib/prisma'
import { EventStatistics } from '@/lib/types'

export async function getEvents(): Promise<Event[]> {
  return await prisma.event.findMany({
    orderBy: {
      date: 'asc'
    }
  })
}

export async function createEvent(name: string, description: string, date: Date): Promise<Event> {
  return await prisma.event.create({
    data: {
      name,
      description,
      date,
    }
  })
}

export async function getEventStatistics(eventId: string): Promise<EventStatistics> {
  const orders = await prisma.order.findMany({
    where: { eventId },
    include: {
      items: {
        include: {
          menuItem: true
        }
      }
    }
  })

  const menuItems = await prisma.menuItem.findMany({
    where: { eventId }
  })

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) =>
    sum + order.items.reduce((orderSum, item) =>
      orderSum + (item.quantity * item.menuItem.price), 0), 0)

  const totalInvestment = menuItems.reduce((sum, item) => sum + item.realPrice, 0)

  const pendingOrders = orders.filter(order => order.status === 'PENDIENTE').length
  const inProgressOrders = orders.filter(order => order.status === 'EN_PREPARACION').length
  const completedOrders = orders.filter(order => order.status === 'COMPLETADO').length

  const itemSales = orders.flatMap(order => order.items)
    .reduce((acc, item) => {
      acc[item.menuItem.name] = (acc[item.menuItem.name] || 0) + item.quantity
      return acc
    }, {} as Record<string, number>)

  const topSellingItems = itemSales
  const topSellingItem = Object.entries(itemSales)
    .reduce((top, [name, quantity]) => quantity > top.quantity ? { name, quantity } : top, { name: '', quantity: 0 })
    .name

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return {
    totalOrders,
    totalRevenue,
    totalInvestment,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    topSellingItem,
    topSellingItems,
    averageOrderValue
  }
}

