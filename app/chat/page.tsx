'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contextos/AuthContexto'
import { useSocket } from '@/hooks/useSocket'
import { Spinner } from '@heroui/react'
import NavbarConversaciones from '@/componentes/NavbarConversaciones'
import AreaChat from '@/componentes/AreaChat'

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
  const { usuario, cargando, logout } = useAuth()
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [conversacionActiva, setConversacionActiva] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [cargandoMensajes, setCargandoMensajes] = useState(false)
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  // Obtener token para Socket.IO
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
      // Evitar duplicados
      if (prev.some(m => m.id === mensaje.id)) return prev
      return [...prev, mensaje]
    })
  }, [])

  const { unirseConversacion, salirConversacion, enviarMensaje } = useSocket({
    token,
    onNuevoMensaje: manejarNuevoMensaje,
  })

  // Cargar conversaciones
  useEffect(() => {
    if (usuario) {
      cargarConversaciones()
    }
  }, [usuario])

  // Unirse a la sala cuando cambia la conversación activa
  useEffect(() => {
    if (conversacionActiva) {
      unirseConversacion(conversacionActiva)
      cargarMensajes(conversacionActiva)

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

  function manejarEnviarMensaje(contenido: string) {
    if (conversacionActiva && contenido.trim()) {
      enviarMensaje(conversacionActiva, contenido.trim())
    }
  }

  function seleccionarConversacion(id: string) {
    setConversacionActiva(id)
    setSidebarAbierto(false)
  }

  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Overlay para móvil cuando sidebar está abierto */}
      {sidebarAbierto && (
        <div
          onClick={() => setSidebarAbierto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'none',
          }}
          className="overlay-movil"
        />
      )}

      {/* Sidebar de conversaciones */}
      <div
        style={{
          width: '320px',
          minWidth: '320px',
          height: '100vh',
          backgroundColor: 'var(--color-superficie)',
          borderRight: '1px solid var(--color-borde)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
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
          onLogout={logout}
        />
      </div>

      {/* Área principal del chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AreaChat
          conversacion={conversaciones.find(c => c.id === conversacionActiva) || null}
          mensajes={mensajes}
          cargandoMensajes={cargandoMensajes}
          usuarioActual={usuario}
          onEnviarMensaje={manejarEnviarMensaje}
          onAbrirSidebar={() => setSidebarAbierto(true)}
        />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            transform: translateX(-100%);
          }
          .sidebar-abierto {
            transform: translateX(0) !important;
          }
          .overlay-movil {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
