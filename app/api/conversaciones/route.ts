import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarToken } from '@/lib/auth'

// Obtener conversaciones del usuario autenticado
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

    const conversaciones = await prisma.conversacion.findMany({
      where: {
        participantes: {
          some: { usuarioId: payload.usuarioId },
        },
      },
      include: {
        participantes: {
          include: {
            usuario: { select: { id: true, nombre: true, email: true } },
          },
        },
        mensajes: {
          orderBy: { creadoEn: 'desc' },
          take: 1,
          select: { creadoEn: true },
        },
      },
      orderBy: { actualizadoEn: 'desc' },
    })

    return NextResponse.json({ conversaciones })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Crear nueva conversación con otro usuario
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const payload = verificarToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body = await request.json()
    const { emailDestino, esChatbot } = body

    let destinatario

    if (esChatbot) {
      // Buscar usuario bot
      destinatario = await prisma.usuario.findUnique({
        where: { email: 'bot@chatbot.ia' },
      })

      if (!destinatario) {
        return NextResponse.json({ error: 'El chatbot no está configurado. Ejecuta el seed del bot.' }, { status: 404 })
      }
    } else {
      if (!emailDestino) {
        return NextResponse.json({ error: 'El email del destinatario es requerido' }, { status: 400 })
      }

      // Buscar usuario destinatario
      destinatario = await prisma.usuario.findUnique({
        where: { email: emailDestino },
      })

      if (!destinatario) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
      }
    }

    if (destinatario.id === payload.usuarioId) {
      return NextResponse.json({ error: 'No puedes crear una conversación contigo mismo' }, { status: 400 })
    }

    // Verificar si ya existe conversación entre ambos
    const conversacionExistente = await prisma.conversacion.findFirst({
      where: {
        AND: [
          { participantes: { some: { usuarioId: payload.usuarioId } } },
          { participantes: { some: { usuarioId: destinatario.id } } },
        ],
      },
      include: {
        participantes: {
          include: {
            usuario: { select: { id: true, nombre: true, email: true } },
          },
        },
      },
    })

    if (conversacionExistente) {
      return NextResponse.json({ conversacion: conversacionExistente })
    }

    // Crear nueva conversación
    const conversacion = await prisma.conversacion.create({
      data: {
        participantes: {
          create: [
            { usuarioId: payload.usuarioId },
            { usuarioId: destinatario.id },
          ],
        },
      },
      include: {
        participantes: {
          include: {
            usuario: { select: { id: true, nombre: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json({ conversacion }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
