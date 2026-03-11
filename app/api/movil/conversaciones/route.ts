import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarTokenMovil } from '@/lib/auth-movil'
import { descifrarMensaje } from '@/lib/cifrado'

// Listar conversaciones del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const auth = verificarTokenMovil(request)
    if (!auth.exito) return auth.respuesta

    const conversaciones = await prisma.conversacion.findMany({
      where: {
        participantes: {
          some: { usuarioId: auth.payload.usuarioId },
        },
      },
      include: {
        participantes: {
          include: {
            usuario: { select: { id: true, nombre: true, email: true, fotoPerfil: true } },
          },
        },
        mensajes: {
          orderBy: { creadoEn: 'desc' },
          take: 1,
        },
      },
      orderBy: { actualizadoEn: 'desc' },
    })

    // Formatear para móvil: incluir último mensaje descifrado y datos de participantes
    const resultado = conversaciones.map(conv => {
      const ultimoMensaje = conv.mensajes[0]
        ? {
            contenido: descifrarMensaje(conv.mensajes[0].contenido, conv.mensajes[0].iv),
            creadoEn: conv.mensajes[0].creadoEn,
            autorId: conv.mensajes[0].autorId,
          }
        : null

      return {
        id: conv.id,
        creadoEn: conv.creadoEn,
        actualizadoEn: conv.actualizadoEn,
        participantes: conv.participantes.map(p => p.usuario),
        ultimoMensaje,
      }
    })

    return NextResponse.json({ conversaciones: resultado })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Crear nueva conversación
export async function POST(request: NextRequest) {
  try {
    const auth = verificarTokenMovil(request)
    if (!auth.exito) return auth.respuesta

    const body = await request.json()
    const { emailDestino, esChatbot } = body

    let destinatario

    if (esChatbot) {
      destinatario = await prisma.usuario.findUnique({
        where: { email: 'bot@chatbot.ia' },
      })

      if (!destinatario) {
        return NextResponse.json(
          { error: 'El chatbot no está configurado' },
          { status: 404 }
        )
      }
    } else {
      if (!emailDestino) {
        return NextResponse.json(
          { error: 'Se requiere emailDestino o esChatbot: true' },
          { status: 400 }
        )
      }

      destinatario = await prisma.usuario.findUnique({
        where: { email: emailDestino },
      })

      if (!destinatario) {
        return NextResponse.json(
          { error: 'Usuario no encontrado con ese email' },
          { status: 404 }
        )
      }
    }

    if (destinatario.id === auth.payload.usuarioId) {
      return NextResponse.json(
        { error: 'No puedes crear una conversación contigo mismo' },
        { status: 400 }
      )
    }

    // Verificar si ya existe conversación entre ambos
    const conversacionExistente = await prisma.conversacion.findFirst({
      where: {
        AND: [
          { participantes: { some: { usuarioId: auth.payload.usuarioId } } },
          { participantes: { some: { usuarioId: destinatario.id } } },
        ],
      },
      include: {
        participantes: {
          include: {
            usuario: { select: { id: true, nombre: true, email: true, fotoPerfil: true } },
          },
        },
      },
    })

    if (conversacionExistente) {
      return NextResponse.json({
        conversacion: {
          id: conversacionExistente.id,
          creadoEn: conversacionExistente.creadoEn,
          actualizadoEn: conversacionExistente.actualizadoEn,
          participantes: conversacionExistente.participantes.map(p => p.usuario),
        },
        existente: true,
      })
    }

    // Crear nueva conversación
    const conversacion = await prisma.conversacion.create({
      data: {
        participantes: {
          create: [
            { usuarioId: auth.payload.usuarioId },
            { usuarioId: destinatario.id },
          ],
        },
      },
      include: {
        participantes: {
          include: {
            usuario: { select: { id: true, nombre: true, email: true, fotoPerfil: true } },
          },
        },
      },
    })

    return NextResponse.json({
      conversacion: {
        id: conversacion.id,
        creadoEn: conversacion.creadoEn,
        actualizadoEn: conversacion.actualizadoEn,
        participantes: conversacion.participantes.map(p => p.usuario),
      },
      existente: false,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
