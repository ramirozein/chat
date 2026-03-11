import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashContrasena, generarToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { nombre, email, contrasena } = await request.json()

    if (!nombre || !email || !contrasena) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos (nombre, email, contrasena)' },
        { status: 400 }
      )
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    const contrasenaHash = await hashContrasena(contrasena)
    const usuario = await prisma.usuario.create({
      data: { nombre, email, contrasena: contrasenaHash },
    })

    const token = generarToken({ usuarioId: usuario.id, email: usuario.email })

    return NextResponse.json({
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
      token,
    }, { status: 201 })
  } catch (error) {
    console.error('Error en registro móvil:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
