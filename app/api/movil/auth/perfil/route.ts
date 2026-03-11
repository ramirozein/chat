import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarTokenMovil } from '@/lib/auth-movil'

export async function PUT(request: NextRequest) {
  try {
    const auth = verificarTokenMovil(request)
    if (!auth.exito) return auth.respuesta

    const { nombre } = await request.json()

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    const usuario = await prisma.usuario.update({
      where: { id: auth.payload.usuarioId },
      data: { nombre: nombre.trim() },
      select: { id: true, nombre: true, email: true, fotoPerfil: true },
    })

    return NextResponse.json({ usuario })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
