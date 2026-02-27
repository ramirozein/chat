'use client'

import { useRef, useEffect } from 'react'
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

  useEffect(() => {
    refFinal.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const nombreContacto = conversacion
    ? conversacion.participantes.find(p => p.usuario.id !== usuarioActual?.id)?.usuario.nombre || 'Chat'
    : null

  function obtenerIniciales(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Estado vacío
  if (!conversacion) {
    return (
      <>
        <style jsx>{`
          .vacio-root {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            padding: 2rem;
            background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
            position: relative;
          }
          .btn-menu-vacio {
            position: absolute;
            top: 1rem;
            left: 1rem;
            display: none;
          }
          .vacio-icon {
            width: 88px;
            height: 88px;
            border-radius: 24px;
            background: linear-gradient(135deg, #FFF7ED, #FFEDD5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            box-shadow: 0 4px 16px rgba(249, 115, 22, 0.1);
          }
          .vacio-titulo {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #1E293B;
          }
          .vacio-desc {
            margin: 0;
            font-size: 0.9rem;
            color: #64748B;
            text-align: center;
            max-width: 280px;
            line-height: 1.5;
          }
          .btn-menu-icono {
            padding: 0.5rem 0.85rem;
            background: #FFF7ED;
            color: #F97316;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
          }
          @media (max-width: 768px) {
            .btn-menu-vacio { display: block; }
          }
        `}</style>
        <div className="vacio-root">
          <div className="btn-menu-vacio">
            <button className="btn-menu-icono" onClick={onAbrirSidebar}>☰</button>
          </div>
          <div className="vacio-icon">💬</div>
          <h2 className="vacio-titulo">Selecciona una conversación</h2>
          <p className="vacio-desc">
            Elige un chat del panel izquierdo o crea uno nuevo para comenzar
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <style jsx>{`
        .chat-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #FAFAFA;
          min-width: 0;
        }
        .chat-header {
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid #E2E8F0;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          flex-shrink: 0;
        }
        .btn-menu-chat {
          display: none;
        }
        .header-avatar {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #F97316, #FB923C);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 600;
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);
        }
        .header-nombre {
          margin: 0;
          font-weight: 600;
          font-size: 1rem;
          color: #1E293B;
        }
        .header-estado {
          margin: 0;
          font-size: 0.78rem;
          color: #22C55E;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .online-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22C55E;
          display: inline-block;
        }
        .chat-mensajes {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .cargando-center {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #FFEDD5;
          border-top-color: #F97316;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .sin-mensajes {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #64748B;
          font-size: 0.9rem;
        }
        .sin-mensajes-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #FFF7ED;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin-bottom: 0.75rem;
        }
        .btn-menu-icono {
          padding: 0.5rem 0.85rem;
          background: #FFF7ED;
          color: #F97316;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        @media (max-width: 768px) {
          .btn-menu-chat { display: block; }
          .chat-mensajes { padding: 0.75rem; }
        }
      `}</style>

      <div className="chat-root">
        <div className="chat-header">
          <div className="btn-menu-chat">
            <button className="btn-menu-icono" onClick={onAbrirSidebar}>☰</button>
          </div>
          <div className="header-avatar">
            {nombreContacto ? obtenerIniciales(nombreContacto) : '?'}
          </div>
          <div>
            <p className="header-nombre">{nombreContacto}</p>
            <p className="header-estado">
              <span className="online-dot" />
              En línea
            </p>
          </div>
        </div>

        <div className="chat-mensajes">
          {cargandoMensajes ? (
            <div className="cargando-center">
              <div className="spinner" />
            </div>
          ) : mensajes.length === 0 ? (
            <div className="sin-mensajes">
              <div className="sin-mensajes-icon">👋</div>
              <p style={{ fontWeight: 500, color: '#1E293B' }}>¡Envía el primer mensaje!</p>
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

        <EntradaMensaje onEnviar={onEnviarMensaje} />
      </div>
    </>
  )
}
