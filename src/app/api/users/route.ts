import { createUser, getUsers } from '@/data/users'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const users = await getUsers()
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ message: 'Error al obtener usuarios' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { username, password, role } = await request.json()
    const newUser = await createUser(username, password, role)
    return NextResponse.json(newUser, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Error al crear usuario' }, { status: 500 })
  }
}

