'use client'

import { useRef, useEffect } from 'react'
import { Spinner, Button } from '@heroui/react'
import BurbujaMensaje from './BurbujaMensaje'
import EntradaMensaje from './EntradaMensaje'

interface Participante {
  usuario: { id: string; nombre: string; email: string }
}

interface Conversacion {
  id: string
  participantes: Participante[]
}

interface Mensaje {
  id: string
  contenido: string
  autorId: string
  autor: { id: string; nombre: string }
  conversacionId: string
  creadoEn: string
}

interface Props {
  conversacion: Conversacion | null
  mensajes: Mensaje[]
  cargandoMensajes: boolean
  usuarioActual: { id: string; nombre: string; email: string } | null
  onEnviarMensaje: (contenido: string) => void
  onAbrirSidebar: () => void
}

export default function AreaChat({
  conversacion,
  mensajes,
  cargandoMensajes,
  usuarioActual,
  onEnviarMensaje,
  onAbrirSidebar,
}: Props) {
  const refFinal = useRef<HTMLDivElement>(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    refFinal.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // Obtener nombre del contacto
  const nombreContacto = conversacion
    ? conversacion.participantes.find(p => p.usuario.id !== usuarioActual?.id)?.usuario.nombre || 'Chat'
    : null

  // Estado vacío: sin conversación seleccionada
  if (!conversacion) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-texto-secundario)',
        gap: '1rem',
        padding: '2rem',
      }}>
        {/* Botón para abrir sidebar en móvil */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem' }} className="btn-menu-movil">
          <Button
            id="btn-menu"
            size="sm"
            variant="flat"
            onPress={onAbrirSidebar}
            style={{ minWidth: 'auto' }}
          >
            ☰
          </Button>
        </div>

        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(129,140,248,0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
        }}>
          💬
        </div>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-texto)' }}>
          Selecciona una conversación
        </h2>
        <p style={{ margin: 0, fontSize: '0.875rem', textAlign: 'center' }}>
          Elige un chat del panel izquierdo o crea uno nuevo
        </p>

        <style jsx>{`
          .btn-menu-movil { display: none; }
          @media (max-width: 768px) {
            .btn-menu-movil { display: block; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      {/* Cabecera del chat */}
      <div style={{
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid var(--color-borde)',
        backgroundColor: 'var(--color-superficie)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        {/* Botón menú para móvil */}
        <div className="btn-menu-movil">
          <Button
            id="btn-menu-chat"
            size="sm"
            variant="flat"
            onPress={onAbrirSidebar}
            style={{ minWidth: 'auto' }}
          >
            ☰
          </Button>
        </div>

        {/* Avatar del contacto */}
        <div style={{
          width: '38px',
          height: '38px',
          minWidth: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: '600',
          color: '#fff',
        }}>
          {nombreContacto?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>

        <div>
          <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>
            {nombreContacto}
          </p>
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            color: 'var(--color-texto-secundario)',
          }}>
            En línea
          </p>
        </div>

        <style jsx>{`
          .btn-menu-movil { display: none; }
          @media (max-width: 768px) {
            .btn-menu-movil { display: block; }
          }
        `}</style>
      </div>

      {/* Área de mensajes */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {cargandoMensajes ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}>
            <Spinner color="primary" />
          </div>
        ) : mensajes.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--color-texto-secundario)',
            fontSize: '0.875rem',
          }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👋</p>
            <p>¡Envía el primer mensaje!</p>
          </div>
        ) : (
          mensajes.map(msg => (
            <BurbujaMensaje
              key={msg.id}
              contenido={msg.contenido}
              autor={msg.autor.nombre}
              esMio={msg.autorId === usuarioActual?.id}
              hora={new Date(msg.creadoEn).toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
          ))
        )}
        <div ref={refFinal} />
      </div>

      {/* Entrada de mensaje */}
      <EntradaMensaje onEnviar={onEnviarMensaje} />
    </div>
  )
}
