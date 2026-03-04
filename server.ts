import { createServer } from 'http'
import next from 'next'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import OpenAI from 'openai'
import { cifrarMensaje, descifrarMensaje } from './lib/cifrado'
import { prisma } from './lib/prisma'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handler = app.getRequestHandler()

const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta-por-defecto'
const BOT_EMAIL = 'bot@chatbot.ia'

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
})

interface PayloadToken {
  usuarioId: string
  email: string
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handler(req, res)
  })

  const io = new Server(httpServer, {
    cors: { origin: '*' },
  })

  // Autenticar socket con token JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('No autenticado'))
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as PayloadToken
      socket.data.usuarioId = payload.usuarioId
      socket.data.email = payload.email
      next()
    } catch {
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.data.usuarioId}`)

    // Unirse a una sala de conversación
    socket.on('unirse-conversacion', (conversacionId: string) => {
      socket.join(conversacionId)
      console.log(`Usuario ${socket.data.usuarioId} se unió a ${conversacionId}`)
    })

    // Salir de una sala de conversación
    socket.on('salir-conversacion', (conversacionId: string) => {
      socket.leave(conversacionId)
    })

    // Enviar mensaje
    socket.on('enviar-mensaje', async (datos: { conversacionId: string; contenido: string }) => {
      try {
        const { conversacionId, contenido } = datos
        const autorId = socket.data.usuarioId

        // Cifrar mensaje antes de guardar
        const { contenido: contenidoCifrado, iv } = cifrarMensaje(contenido)

        // Guardar en base de datos
        const mensaje = await prisma.mensaje.create({
          data: {
            contenido: contenidoCifrado,
            iv,
            autorId,
            conversacionId,
          },
          include: {
            autor: { select: { id: true, nombre: true } },
          },
        })

        // Actualizar timestamp de la conversación
        await prisma.conversacion.update({
          where: { id: conversacionId },
          data: { actualizadoEn: new Date() },
        })

        // Emitir mensaje descifrado a todos en la sala
        io.to(conversacionId).emit('nuevo-mensaje', {
          id: mensaje.id,
          contenido: descifrarMensaje(mensaje.contenido, mensaje.iv),
          autorId: mensaje.autorId,
          autor: mensaje.autor,
          conversacionId: mensaje.conversacionId,
          creadoEn: mensaje.creadoEn,
        })

        // Verificar si la conversación es con el chatbot
        const participantes = await prisma.participanteConversacion.findMany({
          where: { conversacionId },
          include: {
            usuario: { select: { id: true, nombre: true, email: true } },
          },
        })

        const botParticipante = participantes.find(p => p.usuario.email === BOT_EMAIL)

        if (botParticipante) {
          // Obtener historial de mensajes (últimos 20) para contexto
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

          // Emitir indicador de escritura
          io.to(conversacionId).emit('chatbot-escribiendo', true)

          try {
            const stream = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: mensajesOpenAI,
              stream: true,
            })

            let respuestaCompleta = ''

            for await (const chunk of stream) {
              const token = chunk.choices[0]?.delta?.content || ''
              if (token) {
                respuestaCompleta += token
                io.to(conversacionId).emit('chatbot-token', {
                  conversacionId,
                  token,
                  acumulado: respuestaCompleta,
                })
              }
            }

            // Guardar respuesta completa del bot
            if (respuestaCompleta.trim()) {
              const { contenido: contenidoBotCifrado, iv: ivBot } = cifrarMensaje(respuestaCompleta)

              const mensajeBot = await prisma.mensaje.create({
                data: {
                  contenido: contenidoBotCifrado,
                  iv: ivBot,
                  autorId: botParticipante.usuario.id,
                  conversacionId,
                },
                include: {
                  autor: { select: { id: true, nombre: true } },
                },
              })

              await prisma.conversacion.update({
                where: { id: conversacionId },
                data: { actualizadoEn: new Date() },
              })

              // Emitir mensaje final completo del bot
              io.to(conversacionId).emit('chatbot-mensaje-final', {
                id: mensajeBot.id,
                contenido: respuestaCompleta,
                autorId: mensajeBot.autorId,
                autor: mensajeBot.autor,
                conversacionId: mensajeBot.conversacionId,
                creadoEn: mensajeBot.creadoEn,
              })
            }
          } catch (error) {
            console.error('Error al obtener respuesta del chatbot:', error)
            io.to(conversacionId).emit('chatbot-error', {
              conversacionId,
              error: 'No se pudo obtener respuesta del chatbot',
            })
          } finally {
            io.to(conversacionId).emit('chatbot-escribiendo', false)
          }
        }
      } catch (error) {
        console.error('Error al enviar mensaje:', error)
        socket.emit('error-mensaje', { error: 'No se pudo enviar el mensaje' })
      }
    })

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.data.usuarioId}`)
    })
  })

  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`)
  })
})
