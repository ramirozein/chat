'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { obtenerIniciales, obtenerColorAvatar, esConversacionBot } from '@/lib/utils-ui'
import ModalFotoPerfil from './ModalFotoPerfil'
import { MessageSquare, Bot, Plus, MessageCircleOff, User, Moon, Sun, LogOut } from 'lucide-react'

interface Participante {
  usuario: { id: string; nombre: string; email: string; fotoPerfil?: string | null }
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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
          border-right: 1px solid var(--color-borde);
          position: relative;
          z-index: 20;
          box-shadow: 4px 0 24px rgba(0,0,0,0.02);
        }
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-borde);
          background: var(--color-fondo-elevado);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .sidebar-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
          color: var(--color-texto);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          letter-spacing: -0.01em;
        }
        .sidebar-title-accent {
          background: linear-gradient(135deg, var(--color-primario), #ff8a4f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }
        .sidebar-header-btns {
          display: flex;
          gap: 0.5rem;
        }
        .btn-nuevo {
          padding: 0.5rem 1rem;
          border: 1px solid var(--color-primario-suave);
          border-radius: 12px;
          background: var(--color-primario-contenedor);
          color: var(--color-primario);
          font-size: 0.85rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
        }
        .btn-nuevo:hover {
          background: var(--color-primario-suave);
          border-color: var(--color-primario);
          transform: translateY(-1px);
        }
        .btn-chatbot {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          background: rgba(139, 92, 246, 0.1);
          color: #8B5CF6;
          font-size: 0.85rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
        }
        .btn-chatbot:hover {
          background: rgba(139, 92, 246, 0.18);
          border-color: rgba(139, 92, 246, 0.5);
          transform: translateY(-1px);
        }
        .nuevo-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nuevo-input {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 1px solid var(--color-borde);
          border-radius: 16px;
          font-size: 0.9rem;
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
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--color-primario), #ff8a4f);
          color: #FFFFFF;
          font-size: 0.85rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
          box-shadow: var(--sombra-primario);
        }
        .btn-crear:hover { opacity: 0.95; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(255, 107, 44, 0.35); }
        .btn-crear:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .error-nuevo {
          color: var(--color-error);
          font-size: 0.8rem;
          margin: 0;
          font-weight: 500;
        }
        .conversaciones-lista {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
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
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: var(--color-primario-contenedor);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin-bottom: 1rem;
          border: 1px solid var(--color-borde);
          box-shadow: var(--sombra-sm);
        }
        .conv-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          border-radius: 16px;
          border: 1px solid transparent;
          cursor: pointer;
          text-align: left;
          color: var(--color-texto);
          transition: all var(--transicion);
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: transparent;
          position: relative;
          overflow: hidden;
        }
        .conv-item:hover {
          background: var(--color-superficie);
          border-color: var(--color-borde);
        }
        .conv-item.activa {
          background: var(--color-primario-contenedor);
          border-color: var(--color-borde-activo);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .conv-item.activa::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--color-primario);
          border-radius: 4px 0 0 4px;
        }
        .conv-item.activa:hover {
          background: var(--color-primario-suave);
        }
        .conv-avatar {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          transition: all var(--transicion);
          letter-spacing: 0.02em;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .conv-nombre {
          flex: 1;
          min-width: 0;
          font-weight: 600;
          font-size: 0.95rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .conv-item.activa .conv-nombre {
          color: var(--color-primario);
          font-weight: 700;
        }
        .dot-activo {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-primario);
          box-shadow: 0 0 8px rgba(255, 107, 44, 0.6);
          animation: glowPulse 2s ease-in-out infinite;
        }
        .sidebar-footer {
          padding: 1.25rem;
          padding-bottom: max(1.25rem, var(--safe-bottom, 0px));
          border-top: 1px solid var(--color-borde);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-fondo-elevado);
          flex-shrink: 0;
        }
        .footer-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
          flex: 1;
        }
        .footer-avatar {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--color-primario), #ff8a4f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: #FFFFFF;
          cursor: pointer;
          overflow: hidden;
          transition: all var(--transicion);
          box-shadow: var(--sombra-sm);
        }
        .footer-avatar:hover {
          box-shadow: 0 0 0 3px var(--color-primario-suave);
          transform: translateY(-2px);
        }
        .footer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .footer-nombre {
          margin: 0;
          font-weight: 700;
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--color-texto);
        }
        .footer-email {
          margin: 0 0 0.1rem 0;
          color: var(--color-texto-terciario);
          font-size: 0.75rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .btn-salir {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.55rem;
          border: 1px solid var(--color-error-borde);
          border-radius: 10px;
          background: var(--color-error-fondo);
          color: var(--color-error);
          cursor: pointer;
          transition: all var(--transicion);
        }
        .btn-salir:hover {
          background: rgba(248, 113, 113, 0.18);
          border-color: rgba(248, 113, 113, 0.35);
          transform: translateY(-1px);
        }
      `}</style>

      <div className="sidebar-root">
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <h2 className="sidebar-title">
              <span className="sidebar-title-accent"><MessageSquare size={22} /></span> Chats
            </h2>
            <div className="sidebar-header-btns">
              <button className="btn-chatbot" onClick={onCrearChatbot}>
                <Bot size={16} /> IA
              </button>
              <button className="btn-nuevo" onClick={() => setMostrarFormulario(!mostrarFormulario)} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Plus size={16} /> Nuevo
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
              <div className="conv-vacia-icon"><MessageCircleOff size={32} color="var(--color-primario)" /></div>
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
                    }}
                  >
                    {esBot ? <Bot size={20} /> : (
                      otro?.usuario.fotoPerfil ? (
                        <img
                          src={otro.usuario.fotoPerfil}
                          alt={nombre}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 'var(--radio-md)',
                          }}
                        />
                      ) : obtenerIniciales(nombre)
                    )}
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
                usuarioActual?.nombre ? obtenerIniciales(usuarioActual.nombre) : <User size={18} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="footer-nombre">{usuarioActual?.nombre}</p>
              <p className="footer-email">{usuarioActual?.email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {mounted && (
              <button
                className="theme-toggle"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Cambiar tema"
                title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <button className="btn-salir" onClick={onLogout} title="Salir"><LogOut size={18} /></button>
          </div>
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
