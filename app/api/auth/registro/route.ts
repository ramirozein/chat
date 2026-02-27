import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashContrasena, generarToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { nombre, email, contrasena } = await request.json()

    // Validar campos requeridos
    if (!nombre || !email || !contrasena) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    // Crear usuario con contraseña cifrada
    const contrasenaHash = await hashContrasena(contrasena)
    const usuario = await prisma.usuario.create({
      data: { nombre, email, contrasena: contrasenaHash },
    })

    // Generar token JWT
    const token = generarToken({ usuarioId: usuario.id, email: usuario.email })

    // Crear respuesta con cookie httpOnly
    const respuesta = NextResponse.json({
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    })

    respuesta.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    })

    return respuesta
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
