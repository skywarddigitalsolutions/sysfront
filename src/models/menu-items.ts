import prisma from '@/lib/prisma'
import { MenuItem } from '@/lib/types'

export async function getMenuItems(eventId: string): Promise<MenuItem[]> {
  return await prisma.menuItem.findMany({
    where: { eventId },
    include: {
      event: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function getMenuItem(id: string): Promise<MenuItem[]> {
  return await prisma.menuItem.findMany({
    where: { id },
    include: {
      event: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function createMenuItem(data: {
  name: string
  description: string
  price: number
  stock: number
  eventId: string
  totalInvestment: number
}): Promise<MenuItem> {
  return await prisma.menuItem.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      eventId: data.eventId,
      realPrice: data.totalInvestment
    },
    include: {
      event: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function updateMenuItem(
  id: string,
  data: {
    name?: string
    description?: string
    price?: number
    stock?: number
    realPrice?: number
  }
): Promise<MenuItem> {
  return await prisma.menuItem.update({
    where: { id },
    data,
    include: {
      event: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function deleteMenuItem(id: string): Promise<MenuItem> {
  return await prisma.menuItem.delete({
    where: { id },
    include: {
      event: {
        select: {
          name: true,
        },
      },
    },
  })
}
