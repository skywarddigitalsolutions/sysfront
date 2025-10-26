'use server'

import prisma from '@/lib/prisma'
import { Order } from '@prisma/client'

export async function getOrders(eventId: string): Promise<Order[]> {
  return await prisma.order.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          username: true,
        }
      },
      items: {
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              price: true,
            }
          },
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function createOrder(
  userId: string,
  eventId: string,
  customerIdentifier: string,
  items: { menuItemId: string, quantity: number }[]
): Promise<Order> {
  console.info('Creating order', { userId, eventId, customerIdentifier, items })

  try {
    const order = await prisma.order.create({
      data: {
        userId,
        eventId,
        customerIdentifier,
        status: 'PENDIENTE',
      },
    })

    await prisma.orderItem.createMany({
      data: items.map(item => ({
        orderId: order.id,
        quantity: item.quantity,
        menuItemId: item.menuItemId
      }))
    })

    const foundOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        user: {
          select: {
            username: true,
          }
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
              }
            },
          }
        }
      }
    })

    if (!foundOrder) {
      throw new Error(`Order not found after creation: ${order.id}`)
    }

    return foundOrder

  } catch (error) {
    throw error
  }
}

export async function updateOrderStatus(orderId: string, status: 'PENDIENTE' | 'EN_PREPARACION' | 'COMPLETADO'): Promise<Order> {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: {
        select: {
          username: true,
        }
      },
      items: {
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              price: true,
            }
          },
        }
      }
    }
  })
}

export async function deleteOrder(orderId: string): Promise<void> {
  await prisma.orderItem.deleteMany({ where: { orderId } })
  await prisma.order.delete({ where: { id: orderId } })
}