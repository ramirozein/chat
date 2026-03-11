import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarTokenMovil } from '@/lib/auth-movil'
import { cifrarMensaje, descifrarMensaje } from '@/lib/cifrado'
import OpenAI from 'openai'

const BOT_EMAIL = 'bot@chatbot.ia'
const MENSAJES_POR_PAGINA = 50

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('Falta la variable de entorno API_KEY o OPENAI_API_KEY para el chatbot')
    }
    _openai = new OpenAI({ apiKey })
  }
  return _openai
}

// Obtener mensajes descifrados de una conversación con paginación
export async function GET(request: NextRequest) {
  try {
    const auth = verificarTokenMovil(request)
    if (!auth.exito) return auth.respuesta

    const { searchParams } = new URL(request.url)
    const conversacionId = searchParams.get('conversacionId')
    const cursor = searchParams.get('cursor') // ID del último mensaje visto (para paginación)
    const limite = Math.min(
      parseInt(searchParams.get('limite') || String(MENSAJES_POR_PAGINA), 10),
      100
    )

    if (!conversacionId) {
      return NextResponse.json({ error: 'conversacionId es requerido' }, { status: 400 })
    }

    // Verificar que el usuario es participante
    const participante = await prisma.participanteConversacion.findFirst({
      where: {
        conversacionId,
        usuarioId: auth.payload.usuarioId,
      },
    })

    if (!participante) {
      return NextResponse.json({ error: 'No tienes acceso a esta conversación' }, { status: 403 })
    }

    // Paginación basada en cursor
    const mensajes = await prisma.mensaje.findMany({
      where: { conversacionId },
      orderBy: { creadoEn: 'asc' },
      take: limite,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        autor: { select: { id: true, nombre: true, fotoPerfil: true } },
      },
    })

    const mensajesDescifrados = mensajes.map(msg => ({
      id: msg.id,
      contenido: descifrarMensaje(msg.contenido, msg.iv),
      autorId: msg.autorId,
      autor: msg.autor,
      conversacionId: msg.conversacionId,
      creadoEn: msg.creadoEn,
    }))

    return NextResponse.json({
      mensajes: mensajesDescifrados,
      siguienteCursor: mensajes.length === limite ? mensajes[mensajes.length - 1].id : null,
      hayMas: mensajes.length === limite,
    })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Enviar mensaje vía REST (para móvil sin WebSocket activo)
export async function POST(request: NextRequest) {
  try {
    const auth = verificarTokenMovil(request)
    if (!auth.exito) return auth.respuesta

    const { conversacionId, contenido } = await request.json()

    if (!conversacionId || !contenido) {
      return NextResponse.json(
        { error: 'conversacionId y contenido son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el usuario es participante
    const participante = await prisma.participanteConversacion.findFirst({
      where: {
        conversacionId,
        usuarioId: auth.payload.usuarioId,
      },
    })

    if (!participante) {
      return NextResponse.json({ error: 'No tienes acceso a esta conversación' }, { status: 403 })
    }

    // Cifrar y guardar mensaje del usuario
    const { contenido: contenidoCifrado, iv } = cifrarMensaje(contenido)

    const mensaje = await prisma.mensaje.create({
      data: {
        contenido: contenidoCifrado,
        iv,
        autorId: auth.payload.usuarioId,
        conversacionId,
      },
      include: {
        autor: { select: { id: true, nombre: true, fotoPerfil: true } },
      },
    })

    await prisma.conversacion.update({
      where: { id: conversacionId },
      data: { actualizadoEn: new Date() },
    })

    const mensajeRespuesta = {
      id: mensaje.id,
      contenido,
      autorId: mensaje.autorId,
      autor: mensaje.autor,
      conversacionId: mensaje.conversacionId,
      creadoEn: mensaje.creadoEn,
    }

    // Verificar si la conversación incluye al chatbot
    const participantes = await prisma.participanteConversacion.findMany({
      where: { conversacionId },
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
      },
    })

    const botParticipante = participantes.find(p => p.usuario.email === BOT_EMAIL)

    if (!botParticipante) {
      // Conversación normal — retornar solo el mensaje del usuario
      return NextResponse.json({ mensaje: mensajeRespuesta, respuestaBot: null }, { status: 201 })
    }

    // Conversación con chatbot — generar respuesta IA
    try {
      const historial = await prisma.mensaje.findMany({
        where: { conversacionId },
        orderBy: { creadoEn: 'asc' },
        take: 20,
        include: {
          autor: { select: { id: true, nombre: true, email: true } },
        },
      })

      const mensajesOpenAI: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        {
          role: 'system',
          content: 'Eres un asistente amigable y útil. Responde de forma concisa y clara en español. Puedes usar emojis ocasionalmente para hacer la conversación más amena.',
        },
      ]

      for (const msg of historial) {
        const textoDescifrado = descifrarMensaje(msg.contenido, msg.iv)
        if (msg.autor.email === BOT_EMAIL) {
          mensajesOpenAI.push({ role: 'assistant', content: textoDescifrado })
        } else {
          mensajesOpenAI.push({ role: 'user', content: textoDescifrado })
        }
      }

      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: mensajesOpenAI,
      })

      const respuestaTexto = completion.choices[0]?.message?.content || ''

      if (respuestaTexto.trim()) {
        const { contenido: contenidoBotCifrado, iv: ivBot } = cifrarMensaje(respuestaTexto)

        const mensajeBot = await prisma.mensaje.create({
          data: {
            contenido: contenidoBotCifrado,
            iv: ivBot,
            autorId: botParticipante.usuario.id,
            conversacionId,
          },
          include: {
            autor: { select: { id: true, nombre: true, fotoPerfil: true } },
          },
        })

        await prisma.conversacion.update({
          where: { id: conversacionId },
          data: { actualizadoEn: new Date() },
        })

        return NextResponse.json({
          mensaje: mensajeRespuesta,
          respuestaBot: {
            id: mensajeBot.id,
            contenido: respuestaTexto,
            autorId: mensajeBot.autorId,
            autor: mensajeBot.autor,
            conversacionId: mensajeBot.conversacionId,
            creadoEn: mensajeBot.creadoEn,
          },
        }, { status: 201 })
      }
    } catch (error) {
      console.error('Error al obtener respuesta del chatbot (móvil):', error)
      // Retornamos el mensaje del usuario aunque falle el bot
      return NextResponse.json({
        mensaje: mensajeRespuesta,
        respuestaBot: null,
        errorBot: 'No se pudo obtener respuesta del chatbot',
      }, { status: 201 })
    }

    return NextResponse.json({ mensaje: mensajeRespuesta, respuestaBot: null }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
