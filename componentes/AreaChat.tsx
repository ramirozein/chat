'use client'

import { useRef, useEffect } from 'react'
import BurbujaMensaje from './BurbujaMensaje'
import BurbujaEscribiendo from './BurbujaEscribiendo'
import ContenidoMarkdown from './ContenidoMarkdown'
import EntradaMensaje from './EntradaMensaje'
import { obtenerIniciales } from '@/lib/utils-ui'

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
  esChatbot?: boolean
  escribiendo?: boolean
  mensajeParcial?: string
}

export default function AreaChat({
  conversacion,
  mensajes,
  cargandoMensajes,
  usuarioActual,
  onEnviarMensaje,
  onAbrirSidebar,
  esChatbot = false,
  escribiendo = false,
  mensajeParcial = '',
}: Props) {
  const refFinal = useRef<HTMLDivElement>(null)

  useEffect(() => {
    refFinal.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const nombreContacto = conversacion
    ? conversacion.participantes.find(p => p.usuario.id !== usuarioActual?.id)?.usuario.nombre || 'Chat'
    : null



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
            background: var(--color-fondo);
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
            border-radius: var(--radio-xl);
            background: var(--color-primario-contenedor);
            border: 1px solid var(--color-borde);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            animation: gentleFloat 3s ease-in-out infinite;
          }
          .vacio-titulo {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--color-texto);
          }
          .vacio-desc {
            margin: 0;
            font-size: 0.88rem;
            color: var(--color-texto-secundario);
            text-align: center;
            max-width: 280px;
            line-height: 1.5;
          }
          .btn-menu-icono {
            padding: 0.5rem 0.85rem;
            background: var(--color-superficie);
            color: var(--color-primario);
            border: 1px solid var(--color-borde);
            border-radius: var(--radio-md);
            font-size: 1.1rem;
            cursor: pointer;
            font-family: 'Plus Jakarta Sans', sans-serif;
            transition: all var(--transicion);
          }
          .btn-menu-icono:hover {
            background: var(--color-superficie-2);
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
          background: var(--color-fondo);
          min-width: 0;
        }
        .chat-header {
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--color-borde);
          background: var(--color-fondo-elevado);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .btn-menu-chat {
          display: none;
        }
        .header-avatar {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: var(--radio-md);
          background: linear-gradient(135deg, #FF6B2C, #FF8F5C);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(255, 107, 44, 0.2);
        }
        .header-avatar.bot {
          background: linear-gradient(135deg, #8B5CF6, #A78BFA);
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
          font-size: 1.15rem;
        }
        .estado-bot {
          color: #8B5CF6 !important;
        }
        .streaming-burbuja {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 0.2rem;
          animation: fadeIn 0.2s ease-out;
        }
        .streaming-contenido {
          max-width: 75%;
          padding: 0.7rem 1rem;
          border-radius: 16px 16px 16px 4px;
          background: var(--color-superficie);
          color: var(--color-texto);
          word-break: break-word;
          box-shadow: var(--sombra-sm);
          border: 1px solid var(--color-borde);
        }
        .streaming-nombre {
          margin: 0 0 0.2rem 0;
          font-size: 0.7rem;
          font-weight: 700;
          color: #8B5CF6;
          letter-spacing: 0.02em;
        }
        .streaming-texto {
          margin: 0;
          font-size: 0.88rem;
          line-height: 1.55;
        }
        .cursor-parpadeo {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: var(--color-primario);
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 0.8s step-end infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        .header-nombre {
          margin: 0;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-texto);
        }
        .header-estado {
          margin: 0;
          font-size: 0.75rem;
          color: var(--color-exito);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .online-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-exito);
          display: inline-block;
          box-shadow: 0 0 6px rgba(52, 211, 153, 0.5);
        }
        .chat-mensajes {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
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
          border: 3px solid var(--color-superficie-3);
          border-top-color: var(--color-primario);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .sin-mensajes {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--color-texto-secundario);
          font-size: 0.9rem;
        }
        .sin-mensajes-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radio-lg);
          background: var(--color-primario-contenedor);
          border: 1px solid var(--color-borde);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin-bottom: 0.75rem;
        }
        .btn-menu-icono {
          padding: 0.5rem 0.85rem;
          background: var(--color-superficie);
          color: var(--color-primario);
          border: 1px solid var(--color-borde);
          border-radius: var(--radio-md);
          font-size: 1.1rem;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all var(--transicion);
        }
        .btn-menu-icono:hover {
          background: var(--color-superficie-2);
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
          <div className={`header-avatar${esChatbot ? ' bot' : ''}`}>
            {esChatbot ? '🤖' : (nombreContacto ? obtenerIniciales(nombreContacto) : '?')}
          </div>
          <div>
            <p className="header-nombre">{esChatbot ? 'ChatBot IA' : nombreContacto}</p>
            <p className={`header-estado${esChatbot ? ' estado-bot' : ''}`}>
              <span className="online-dot" style={esChatbot ? { background: '#8B5CF6', boxShadow: '0 0 6px rgba(139, 92, 246, 0.5)' } : undefined} />
              {esChatbot ? 'IA' : 'En línea'}
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
              <p style={{ fontWeight: 600, color: 'var(--color-texto)' }}>¡Envía el primer mensaje!</p>
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
          {/* Burbuja de streaming del bot */}
          {esChatbot && mensajeParcial && (
            <div className="streaming-burbuja">
              <div className="streaming-contenido">
                <p className="streaming-nombre">ChatBot IA</p>
                <div className="streaming-texto">
                  <ContenidoMarkdown contenido={mensajeParcial} />
                  <span className="cursor-parpadeo" />
                </div>
              </div>
            </div>
          )}
          {/* Indicador de escritura */}
          {esChatbot && escribiendo && !mensajeParcial && <BurbujaEscribiendo />}
          <div ref={refFinal} />
        </div>

        <EntradaMensaje onEnviar={onEnviarMensaje} />
      </div>
    </>
  )
}
