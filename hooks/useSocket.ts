'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface MensajeSocket {
  id: string
  contenido: string
  autorId: string
  autor: { id: string; nombre: string }
  conversacionId: string
  creadoEn: string
}

interface UseSocketOpciones {
  token: string | null
  onNuevoMensaje: (mensaje: MensajeSocket) => void
}

export function useSocket({ token, onNuevoMensaje }: UseSocketOpciones) {
  const socketRef = useRef<Socket | null>(null)
  const callbackRef = useRef(onNuevoMensaje)

  // Mantener referencia actualizada del callback
  useEffect(() => {
    callbackRef.current = onNuevoMensaje
  }, [onNuevoMensaje])

  // Conectar socket
  useEffect(() => {
    if (!token) return

    const socket = io({
      auth: { token },
    })

    socket.on('nuevo-mensaje', (mensaje: MensajeSocket) => {
      callbackRef.current(mensaje)
    })

    socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error.message)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [token])

  const unirseConversacion = useCallback((conversacionId: string) => {
    socketRef.current?.emit('unirse-conversacion', conversacionId)
  }, [])

  const salirConversacion = useCallback((conversacionId: string) => {
    socketRef.current?.emit('salir-conversacion', conversacionId)
  }, [])

  const enviarMensaje = useCallback((conversacionId: string, contenido: string) => {
    socketRef.current?.emit('enviar-mensaje', { conversacionId, contenido })
  }, [])

  return { unirseConversacion, salirConversacion, enviarMensaje }
}
