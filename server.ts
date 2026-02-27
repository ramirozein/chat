import { createServer } from 'http'
import next from 'next'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cifrarMensaje, descifrarMensaje } from './lib/cifrado'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handler = app.getRequestHandler()
const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta-por-defecto'

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
