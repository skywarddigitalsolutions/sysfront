import { User } from '@prisma/client'
import prisma from '../lib/prisma'

export async function getUsers(): Promise<User[]> {
  return await prisma.user.findMany()
}

export async function createUser(username: string, password: string, role: 'ADMIN' | 'CAJA' | 'COCINA'): Promise<User> {
  const hashedPassword = password // TODO: hash password

  return await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role,
    }
  })
}

