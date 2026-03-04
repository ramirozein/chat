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

interface TokenChatbot {
  conversacionId: string
  token: string
  acumulado: string
}

interface UseSocketOpciones {
  token: string | null
  onNuevoMensaje: (mensaje: MensajeSocket) => void
  onChatbotEscribiendo?: (escribiendo: boolean) => void
  onChatbotToken?: (datos: TokenChatbot) => void
  onChatbotMensajeFinal?: (mensaje: MensajeSocket) => void
}

export function useSocket({ token, onNuevoMensaje, onChatbotEscribiendo, onChatbotToken, onChatbotMensajeFinal }: UseSocketOpciones) {
  const socketRef = useRef<Socket | null>(null)
  const callbackRef = useRef(onNuevoMensaje)
  const cbEscribiendoRef = useRef(onChatbotEscribiendo)
  const cbTokenRef = useRef(onChatbotToken)
  const cbFinalRef = useRef(onChatbotMensajeFinal)

  // Mantener referencias actualizadas de los callbacks
  useEffect(() => {
    callbackRef.current = onNuevoMensaje
  }, [onNuevoMensaje])

  useEffect(() => {
    cbEscribiendoRef.current = onChatbotEscribiendo
  }, [onChatbotEscribiendo])

  useEffect(() => {
    cbTokenRef.current = onChatbotToken
  }, [onChatbotToken])

  useEffect(() => {
    cbFinalRef.current = onChatbotMensajeFinal
  }, [onChatbotMensajeFinal])

  // Conectar socket
  useEffect(() => {
    if (!token) return

    const socket = io({
      auth: { token },
    })

    socket.on('nuevo-mensaje', (mensaje: MensajeSocket) => {
      callbackRef.current(mensaje)
    })

    socket.on('chatbot-escribiendo', (escribiendo: boolean) => {
      cbEscribiendoRef.current?.(escribiendo)
    })

    socket.on('chatbot-token', (datos: TokenChatbot) => {
      cbTokenRef.current?.(datos)
    })

    socket.on('chatbot-mensaje-final', (mensaje: MensajeSocket) => {
      cbFinalRef.current?.(mensaje)
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
