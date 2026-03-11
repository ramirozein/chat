import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarToken } from '@/lib/auth'
import { descifrarMensaje } from '@/lib/cifrado'

// Obtener mensajes descifrados de una conversación
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const payload = verificarToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversacionId = searchParams.get('conversacionId')

    if (!conversacionId) {
      return NextResponse.json({ error: 'conversacionId es requerido' }, { status: 400 })
    }

    // Verificar que el usuario es participante de la conversación
    const participante = await prisma.participanteConversacion.findFirst({
      where: {
        conversacionId,
        usuarioId: payload.usuarioId,
      },
    })

    if (!participante) {
      return NextResponse.json({ error: 'No tienes acceso a esta conversación' }, { status: 403 })
    }

    // Obtener mensajes
    const mensajes = await prisma.mensaje.findMany({
      where: { conversacionId },
      orderBy: { creadoEn: 'asc' },
      include: {
        autor: { select: { id: true, nombre: true, fotoPerfil: true } },
      },
    })

    // Descifrar mensajes
    const mensajesDescifrados = mensajes.map(msg => ({
      id: msg.id,
      contenido: descifrarMensaje(msg.contenido, msg.iv),
      autorId: msg.autorId,
      autor: msg.autor,
      conversacionId: msg.conversacionId,
      creadoEn: msg.creadoEn,
    }))

    return NextResponse.json({ mensajes: mensajesDescifrados })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
