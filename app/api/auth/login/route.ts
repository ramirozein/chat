import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarContrasena, generarToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, contrasena } = await request.json()

    // Validar campos requeridos
    if (!email || !contrasena) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const contrasenaValida = await verificarContrasena(contrasena, usuario.contrasena)

    if (!contrasenaValida) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

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
