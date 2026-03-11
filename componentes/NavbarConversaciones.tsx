'use client'

import { useState } from 'react'
import { obtenerIniciales, obtenerColorAvatar, esConversacionBot } from '@/lib/utils-ui'
import ModalFotoPerfil from './ModalFotoPerfil'

interface Participante {
  usuario: { id: string; nombre: string; email: string }
}

interface Conversacion {
  id: string
  participantes: Participante[]
}

interface Props {
  conversaciones: Conversacion[]
  conversacionActiva: string | null
  usuarioActual: { id: string; nombre: string; email: string; fotoPerfil?: string } | null
  onSeleccionar: (id: string) => void
  onCrear: (email: string) => Promise<{ ok: boolean; error?: string }>
  onCrearChatbot: () => Promise<void>
  onLogout: () => void
  onActualizarFoto: (archivo: File) => Promise<{ ok: boolean; error?: string }>
}


export default function NavbarConversaciones({
  conversaciones,
  conversacionActiva,
  usuarioActual,
  onSeleccionar,
  onCrear,
  onCrearChatbot,
  onLogout,
  onActualizarFoto,
}: Props) {
  const [emailNuevo, setEmailNuevo] = useState('')
  const [errorNuevo, setErrorNuevo] = useState('')
  const [creando, setCreando] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [modalFotoAbierto, setModalFotoAbierto] = useState(false)

  async function manejarCrear(e: React.FormEvent) {
    e.preventDefault()
    setErrorNuevo('')
    if (!emailNuevo.trim()) return

    setCreando(true)
    const resultado = await onCrear(emailNuevo.trim())
    if (resultado.ok) {
      setEmailNuevo('')
      setMostrarFormulario(false)
    } else {
      setErrorNuevo(resultado.error || 'Error al crear conversación')
    }
    setCreando(false)
  }



  return (
    <>
      <style jsx>{`
        .sidebar-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--color-fondo-elevado);
        }
        .sidebar-header {
          padding: 1.25rem;
          border-bottom: 1px solid var(--color-borde);
        }
        .sidebar-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: var(--color-texto);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sidebar-title-accent {
          background: linear-gradient(135deg, #FF6B2C, #FF8F5C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }
        .sidebar-header-btns {
          display: flex;
          gap: 0.4rem;
        }
        .btn-nuevo {
          padding: 0.45rem 0.9rem;
          border: 1px solid var(--color-borde);
          border-radius: var(--radio-md);
          background: var(--color-primario-contenedor);
          color: var(--color-primario);
          font-size: 0.8rem;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
        }
        .btn-nuevo:hover {
          background: var(--color-primario-suave);
          border-color: var(--color-borde-activo);
        }
        .btn-chatbot {
          padding: 0.45rem 0.9rem;
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: var(--radio-md);
          background: rgba(139, 92, 246, 0.08);
          color: #8B5CF6;
          font-size: 0.8rem;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
        }
        .btn-chatbot:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.4);
        }
        .nuevo-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.75rem;
          animation: fadeIn 0.2s ease-out;
        }
        .nuevo-input {
          width: 100%;
          padding: 0.7rem 0.875rem;
          border: 1px solid var(--color-borde);
          border-radius: var(--radio-md);
          font-size: 0.85rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--color-texto);
          background: var(--color-superficie);
          outline: none;
          transition: all var(--transicion);
        }
        .nuevo-input:focus {
          border-color: var(--color-primario);
          box-shadow: 0 0 0 3px var(--color-primario-suave);
        }
        .nuevo-input::placeholder {
          color: var(--color-texto-terciario);
        }
        .btn-crear {
          padding: 0.6rem 1rem;
          border: none;
          border-radius: var(--radio-md);
          background: linear-gradient(135deg, #FF6B2C, #FF8F5C);
          color: #FFFFFF;
          font-size: 0.8rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
          box-shadow: var(--sombra-primario);
        }
        .btn-crear:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-crear:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .error-nuevo {
          color: var(--color-error);
          font-size: 0.75rem;
          margin: 0;
        }
        .conversaciones-lista {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }
        .conv-vacia {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 2rem;
          color: var(--color-texto-secundario);
        }
        .conv-vacia-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radio-lg);
          background: var(--color-primario-contenedor);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin-bottom: 0.75rem;
          border: 1px solid var(--color-borde);
        }
        .conv-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.75rem;
          border-radius: var(--radio-md);
          border: none;
          cursor: pointer;
          text-align: left;
          color: var(--color-texto);
          margin-bottom: 0.15rem;
          transition: all var(--transicion);
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: transparent;
        }
        .conv-item:hover {
          background: var(--color-superficie);
        }
        .conv-item.activa {
          background: var(--color-primario-contenedor);
          border: 1px solid var(--color-borde-activo);
        }
        .conv-item.activa:hover {
          background: var(--color-primario-suave);
        }
        .conv-avatar {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: var(--radio-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          transition: all var(--transicion);
          letter-spacing: 0.02em;
        }
        .conv-nombre {
          flex: 1;
          min-width: 0;
          font-weight: 500;
          font-size: 0.88rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .conv-item.activa .conv-nombre {
          color: var(--color-primario);
          font-weight: 600;
        }
        .dot-activo {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-primario);
          box-shadow: 0 0 8px rgba(255, 107, 44, 0.5);
          animation: glowPulse 2s ease-in-out infinite;
        }
        .sidebar-footer {
          padding: 0.875rem 1.25rem;
          border-top: 1px solid var(--color-borde);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-fondo);
        }
        .footer-info {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          min-width: 0;
          flex: 1;
        }
        .footer-avatar {
          width: 34px;
          height: 34px;
          min-width: 34px;
          border-radius: var(--radio-sm);
          background: linear-gradient(135deg, #FF6B2C, #FF8F5C);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          color: #FFFFFF;
          cursor: pointer;
          overflow: hidden;
          transition: all var(--transicion);
          position: relative;
        }
        .footer-avatar:hover {
          box-shadow: 0 0 0 2px var(--color-primario);
          transform: scale(1.05);
        }
        .footer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .footer-nombre {
          margin: 0;
          font-weight: 600;
          font-size: 0.82rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--color-texto);
        }
        .footer-email {
          margin: 0;
          color: var(--color-texto-terciario);
          font-size: 0.7rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .btn-salir {
          padding: 0.4rem 0.75rem;
          border: 1px solid var(--color-error-borde);
          border-radius: var(--radio-sm);
          background: var(--color-error-fondo);
          color: var(--color-error);
          font-size: 0.75rem;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
        }
        .btn-salir:hover {
          background: rgba(248, 113, 113, 0.18);
          border-color: rgba(248, 113, 113, 0.35);
        }
      `}</style>

      <div className="sidebar-root">
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <h2 className="sidebar-title">
              <span className="sidebar-title-accent">💬</span> Chats
            </h2>
            <div className="sidebar-header-btns">
              <button className="btn-chatbot" onClick={onCrearChatbot}>
                🤖 IA
              </button>
              <button className="btn-nuevo" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                + Nuevo
              </button>
            </div>
          </div>

          {mostrarFormulario && (
            <form onSubmit={manejarCrear} className="nuevo-form">
              <input
                className="nuevo-input"
                placeholder="Email del contacto"
                value={emailNuevo}
                onChange={e => setEmailNuevo(e.target.value)}
              />
              {errorNuevo && <p className="error-nuevo">{errorNuevo}</p>}
              <button className="btn-crear" type="submit" disabled={creando}>
                {creando ? 'Creando...' : 'Iniciar Chat'}
              </button>
            </form>
          )}
        </div>

        <div className="conversaciones-lista">
          {conversaciones.length === 0 ? (
            <div className="conv-vacia">
              <div className="conv-vacia-icon">🗨️</div>
              <p style={{ fontWeight: 600, color: 'var(--color-texto)', margin: '0 0 0.25rem' }}>
                No tienes conversaciones
              </p>
              <p style={{ fontSize: '0.75rem', margin: 0 }}>
                Presiona &quot;+ Nuevo&quot; para chatear
              </p>
            </div>
          ) : (
            conversaciones.map(conv => {
              const otro = conv.participantes.find(p => p.usuario.id !== usuarioActual?.id)
              const nombre = otro?.usuario.nombre || 'Desconocido'
              const activa = conv.id === conversacionActiva
              const color = obtenerColorAvatar(nombre)
              const esBot = esConversacionBot(conv.participantes)

              return (
                <button
                  key={conv.id}
                  onClick={() => onSeleccionar(conv.id)}
                  className={`conv-item ${activa ? 'activa' : ''}`}
                >
                  <div
                    className="conv-avatar"
                    style={{
                      background: esBot
                        ? (activa ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)' : 'rgba(139, 92, 246, 0.1)')
                        : (activa
                          ? `linear-gradient(135deg, ${color}, ${color}99)`
                          : 'var(--color-superficie)'),
                      color: activa ? '#FFF' : (esBot ? '#8B5CF6' : 'var(--color-texto-secundario)'),
                      border: activa ? 'none' : (esBot ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid var(--color-borde)'),
                      fontSize: esBot ? '1.1rem' : undefined,
                    }}
                  >
                    {esBot ? '🤖' : obtenerIniciales(nombre)}
                  </div>
                  <span className="conv-nombre">{esBot ? 'ChatBot IA' : nombre}</span>
                  {activa && <span className="dot-activo" />}
                </button>
              )
            })
          )}
        </div>

        <div className="sidebar-footer">
          <div className="footer-info">
            <div className="footer-avatar" onClick={() => setModalFotoAbierto(true)} title="Cambiar foto de perfil">
              {usuarioActual?.fotoPerfil ? (
                <img src={usuarioActual.fotoPerfil} alt={usuarioActual.nombre} />
              ) : (
                usuarioActual?.nombre ? obtenerIniciales(usuarioActual.nombre) : '?'
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="footer-nombre">{usuarioActual?.nombre}</p>
              <p className="footer-email">{usuarioActual?.email}</p>
            </div>
          </div>
          <button className="btn-salir" onClick={onLogout}>Salir</button>
        </div>

        <ModalFotoPerfil
          abierto={modalFotoAbierto}
          onCerrar={() => setModalFotoAbierto(false)}
          onSubir={onActualizarFoto}
          fotoActual={usuarioActual?.fotoPerfil}
          nombre={usuarioActual?.nombre}
        />
      </div>
    </>
  )
}
