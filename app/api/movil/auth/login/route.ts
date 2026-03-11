import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarContrasena, generarToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, contrasena } = await request.json()

    if (!email || !contrasena) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const contrasenaValida = await verificarContrasena(contrasena, usuario.contrasena)

    if (!contrasenaValida) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const token = generarToken({ usuarioId: usuario.id, email: usuario.email })

    return NextResponse.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        fotoPerfil: usuario.fotoPerfil,
      },
      token,
    })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
