import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarTokenMovil } from '@/lib/auth-movil'

export async function GET(request: NextRequest) {
  try {
    const auth = verificarTokenMovil(request)
    if (!auth.exito) return auth.respuesta

    const usuario = await prisma.usuario.findUnique({
      where: { id: auth.payload.usuarioId },
      select: { id: true, nombre: true, email: true, fotoPerfil: true, creadoEn: true },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ usuario })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
