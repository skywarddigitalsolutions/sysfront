import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  // If its admin, cada o pedidos return an user
  try {
    const { username, password } = await request.json()

    if (username === 'admin' && password === 'admin') {
      return NextResponse.json({ role: 'ADMIN', username: 'admin', id: 'admin_user_id_001' })
    }

    if (username === 'caja' && password === 'caja') {
      return NextResponse.json({ role: 'CAJA', username: 'caja', id: 'caja_user_id_002' })
    }

    if (username === 'cocina' && password === 'cocina') {
      return NextResponse.json({ role: 'COCINA', username: 'cocina', id: 'cocina_user_id_003' })
    }

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })
    }

    const isPasswordValid = password === user.password

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: removePassword, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error en la autenticación:', error)
    return NextResponse.json({ message: 'Error en la autenticación' }, { status: 500 })
  }
}

