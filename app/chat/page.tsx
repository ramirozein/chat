'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contextos/AuthContexto'
import { useSocket } from '@/hooks/useSocket'
import NavbarConversaciones from '@/componentes/NavbarConversaciones'
import AreaChat from '@/componentes/AreaChat'
import { esConversacionBot } from '@/lib/utils-ui'

interface Participante {
  usuario: { id: string; nombre: string; email: string }
}

interface Conversacion {
  id: string
  participantes: Participante[]
  mensajes: { creadoEn: string }[]
}

interface Mensaje {
  id: string
  contenido: string
  autorId: string
  autor: { id: string; nombre: string }
  conversacionId: string
  creadoEn: string
}

export default function PaginaChat() {
  const { usuario, cargando, logout, actualizarFotoPerfil } = useAuth()
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [conversacionActiva, setConversacionActiva] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [cargandoMensajes, setCargandoMensajes] = useState(false)
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  // Estado del chatbot
  const [botEscribiendo, setBotEscribiendo] = useState(false)
  const [mensajeParcial, setMensajeParcial] = useState('')

  useEffect(() => {
    async function obtenerToken() {
      try {
        const res = await fetch('/api/auth/token')
        if (res.ok) {
          const data = await res.json()
          setToken(data.token)
        }
      } catch {
        // Sin token
      }
    }
    if (usuario) obtenerToken()
  }, [usuario])

  const manejarNuevoMensaje = useCallback((mensaje: Mensaje) => {
    setMensajes(prev => {
      if (prev.some(m => m.id === mensaje.id)) return prev
      return [...prev, mensaje]
    })
  }, [])

  const manejarChatbotEscribiendo = useCallback((escribiendo: boolean) => {
    setBotEscribiendo(escribiendo)
    if (escribiendo) {
      setMensajeParcial('')
    }
  }, [])

  const manejarChatbotToken = useCallback((datos: { conversacionId: string; token: string; acumulado: string }) => {
    setMensajeParcial(datos.acumulado)
  }, [])

  const manejarChatbotMensajeFinal = useCallback((mensaje: Mensaje) => {
    setMensajeParcial('')
    setBotEscribiendo(false)
    setMensajes(prev => {
      if (prev.some(m => m.id === mensaje.id)) return prev
      return [...prev, mensaje]
    })
  }, [])

  const { unirseConversacion, salirConversacion, enviarMensaje } = useSocket({
    token,
    onNuevoMensaje: manejarNuevoMensaje,
    onChatbotEscribiendo: manejarChatbotEscribiendo,
    onChatbotToken: manejarChatbotToken,
    onChatbotMensajeFinal: manejarChatbotMensajeFinal,
  })

  useEffect(() => {
    if (usuario) {
      cargarConversaciones()
    }
  }, [usuario])

  useEffect(() => {
    if (conversacionActiva) {
      unirseConversacion(conversacionActiva)
      cargarMensajes(conversacionActiva)
      // Limpiar estado del bot al cambiar de conversación
      setBotEscribiendo(false)
      setMensajeParcial('')

      return () => {
        salirConversacion(conversacionActiva)
      }
    }
  }, [conversacionActiva, unirseConversacion, salirConversacion])

  async function cargarConversaciones() {
    try {
      const res = await fetch('/api/conversaciones')
      if (res.ok) {
        const data = await res.json()
        setConversaciones(data.conversaciones)
      }
    } catch {
      console.error('Error al cargar conversaciones')
    }
  }

  async function cargarMensajes(conversacionId: string) {
    setCargandoMensajes(true)
    try {
      const res = await fetch(`/api/mensajes?conversacionId=${conversacionId}`)
      if (res.ok) {
        const data = await res.json()
        setMensajes(data.mensajes)
      }
    } catch {
      console.error('Error al cargar mensajes')
    } finally {
      setCargandoMensajes(false)
    }
  }

  async function crearConversacion(emailDestino: string) {
    try {
      const res = await fetch('/api/conversaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailDestino }),
      })

      if (res.ok) {
        const data = await res.json()
        await cargarConversaciones()
        setConversacionActiva(data.conversacion.id)
        setSidebarAbierto(false)
        return { ok: true }
      } else {
        const data = await res.json()
        return { ok: false, error: data.error }
      }
    } catch {
      return { ok: false, error: 'Error de conexión' }
    }
  }

  async function crearChatbot() {
    try {
      const res = await fetch('/api/conversaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ esChatbot: true }),
      })

      if (res.ok) {
        const data = await res.json()
        await cargarConversaciones()
        setConversacionActiva(data.conversacion.id)
        setSidebarAbierto(false)
      }
    } catch {
      console.error('Error al crear chatbot')
    }
  }

  function manejarEnviarMensaje(contenido: string) {
    if (conversacionActiva && contenido.trim()) {
      enviarMensaje(conversacionActiva, contenido.trim())
    }
  }

  function seleccionarConversacion(id: string) {
    setConversacionActiva(id)
    setSidebarAbierto(false)
  }

  const convActiva = conversaciones.find(c => c.id === conversacionActiva) || null
  const esChatbot = convActiva
    ? esConversacionBot(convActiva.participantes)
    : false

  if (cargando) {
    return (
      <>
        <style jsx>{`
          .spinner-page {
            display: flex;
            justify-content: center;
            align-items: center;
            height: var(--app-height, 100dvh);
            background: var(--color-fondo);
          }
          .spinner-ring {
            width: 40px;
            height: 40px;
            border: 3px solid var(--color-superficie-3);
            border-top-color: var(--color-primario);
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }
        `}</style>
        <div className="spinner-page">
          <div className="spinner-ring" />
        </div>
      </>
    )
  }

  return (
    <div style={{
      display: 'flex',
      height: 'var(--app-height, 100dvh)',
      overflow: 'hidden',
      position: 'relative',
      background: 'var(--color-fondo)',
    }}>
      {/* Overlay para móvil cuando sidebar está abierto */}
      {sidebarAbierto && (
        <div
          onClick={() => setSidebarAbierto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 40,
            backdropFilter: 'blur(4px)',
          }}
          className="overlay-movil"
        />
      )}

      {/* Sidebar de conversaciones */}
      <div
        style={{
          width: '320px',
          minWidth: '320px',
          height: 'var(--app-height, 100dvh)',
          backgroundColor: 'var(--color-fondo-elevado)',
          borderRight: '1px solid var(--color-borde)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 50,
        }}
        className={`sidebar ${sidebarAbierto ? 'sidebar-abierto' : ''}`}
      >
        <NavbarConversaciones
          conversaciones={conversaciones}
          conversacionActiva={conversacionActiva}
          usuarioActual={usuario}
          onSeleccionar={seleccionarConversacion}
          onCrear={crearConversacion}
          onCrearChatbot={crearChatbot}
          onLogout={logout}
          onActualizarFoto={actualizarFotoPerfil}
        />
      </div>

      {/* Área principal del chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AreaChat
          conversacion={convActiva}
          mensajes={mensajes}
          cargandoMensajes={cargandoMensajes}
          usuarioActual={usuario}
          onEnviarMensaje={manejarEnviarMensaje}
          onAbrirSidebar={() => setSidebarAbierto(true)}
          esChatbot={esChatbot}
          escribiendo={botEscribiendo}
          mensajeParcial={mensajeParcial}
        />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            max-width: 85vw;
            transform: translateX(-100%);
            box-shadow: none;
          }
          .sidebar-abierto {
            transform: translateX(0) !important;
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
          }
        }
        @media (min-width: 769px) {
          .overlay-movil {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
