'use client'

import { useState } from 'react'

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
  usuarioActual: { id: string; nombre: string; email: string } | null
  onSeleccionar: (id: string) => void
  onCrear: (email: string) => Promise<{ ok: boolean; error?: string }>
  onLogout: () => void
}

export default function NavbarConversaciones({
  conversaciones,
  conversacionActiva,
  usuarioActual,
  onSeleccionar,
  onCrear,
  onLogout,
}: Props) {
  const [emailNuevo, setEmailNuevo] = useState('')
  const [errorNuevo, setErrorNuevo] = useState('')
  const [creando, setCreando] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

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

  function obtenerNombreContacto(conversacion: Conversacion): string {
    const otro = conversacion.participantes.find(
      p => p.usuario.id !== usuarioActual?.id
    )
    return otro?.usuario.nombre || 'Desconocido'
  }

  function obtenerIniciales(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  function obtenerColorAvatar(nombre: string): string {
    const colores = [
      '#F97316', '#EF4444', '#8B5CF6', '#06B6D4',
      '#10B981', '#F59E0B', '#EC4899', '#6366F1',
    ]
    return colores[nombre.charCodeAt(0) % colores.length]
  }

  return (
    <>
      <style jsx>{`
        .sidebar-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #FFFFFF;
        }
        .sidebar-header {
          padding: 1.25rem;
          border-bottom: 1px solid #E2E8F0;
        }
        .sidebar-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .sidebar-title {
          font-size: 1.35rem;
          font-weight: 700;
          margin: 0;
          color: #1E293B;
        }
        .sidebar-title-icon {
          background: linear-gradient(135deg, #F97316, #FB923C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .btn-nuevo {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 12px;
          background: #FFF7ED;
          color: #F97316;
          font-size: 0.85rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-nuevo:hover {
          background: #FFEDD5;
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
          padding: 0.75rem 1rem;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
          color: #1E293B;
          background: #F8FAFC;
          outline: none;
          transition: border-color 0.2s;
        }
        .nuevo-input:focus {
          border-color: #F97316;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }
        .btn-crear {
          padding: 0.65rem 1rem;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #F97316, #FB923C);
          color: #FFFFFF;
          font-size: 0.85rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-crear:hover { opacity: 0.9; }
        .btn-crear:disabled { opacity: 0.6; cursor: not-allowed; }
        .error-nuevo {
          color: #DC2626;
          font-size: 0.78rem;
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
          color: #64748B;
        }
        .conv-vacia-icon {
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
        .conv-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          text-align: left;
          color: #1E293B;
          margin-bottom: 0.25rem;
          transition: background-color 0.15s;
          font-family: 'Inter', sans-serif;
        }
        .conv-item:hover {
          background: #F1F5F9;
        }
        .conv-item.activa {
          background: #FFF7ED;
        }
        .conv-item.activa:hover {
          background: #FFF7ED;
        }
        .conv-avatar {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .conv-nombre {
          flex: 1;
          min-width: 0;
          font-weight: 500;
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .conv-item.activa .conv-nombre {
          color: #F97316;
          font-weight: 600;
        }
        .dot-activo {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F97316;
          box-shadow: 0 0 6px rgba(249, 115, 22, 0.4);
        }
        .sidebar-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FAFAFA;
        }
        .footer-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
          flex: 1;
        }
        .footer-avatar {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #F97316, #FB923C);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          color: #FFFFFF;
        }
        .footer-nombre {
          margin: 0;
          font-weight: 600;
          font-size: 0.85rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #1E293B;
        }
        .footer-email {
          margin: 0;
          color: #64748B;
          font-size: 0.72rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .btn-salir {
          padding: 0.4rem 0.85rem;
          border: 1px solid #FECACA;
          border-radius: 10px;
          background: #FEF2F2;
          color: #DC2626;
          font-size: 0.8rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-salir:hover {
          background: #FEE2E2;
        }
      `}</style>

      <div className="sidebar-root">
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <h2 className="sidebar-title">
              <span className="sidebar-title-icon">💬</span> Chats
            </h2>
            <button className="btn-nuevo" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
              + Nuevo
            </button>
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
              <p style={{ fontWeight: 500, color: '#1E293B', margin: '0 0 0.25rem' }}>
                No tienes conversaciones
              </p>
              <p style={{ fontSize: '0.78rem', margin: 0 }}>
                Presiona &quot;+ Nuevo&quot; para chatear
              </p>
            </div>
          ) : (
            conversaciones.map(conv => {
              const nombre = obtenerNombreContacto(conv)
              const activa = conv.id === conversacionActiva
              const color = obtenerColorAvatar(nombre)

              return (
                <button
                  key={conv.id}
                  onClick={() => onSeleccionar(conv.id)}
                  className={`conv-item ${activa ? 'activa' : ''}`}
                >
                  <div
                    className="conv-avatar"
                    style={{
                      background: activa ? `linear-gradient(135deg, ${color}, ${color}cc)` : '#F1F5F9',
                      color: activa ? '#FFF' : '#64748B',
                    }}
                  >
                    {obtenerIniciales(nombre)}
                  </div>
                  <span className="conv-nombre">{nombre}</span>
                  {activa && <span className="dot-activo" />}
                </button>
              )
            })
          )}
        </div>

        <div className="sidebar-footer">
          <div className="footer-info">
            <div className="footer-avatar">
              {usuarioActual?.nombre ? obtenerIniciales(usuarioActual.nombre) : '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="footer-nombre">{usuarioActual?.nombre}</p>
              <p className="footer-email">{usuarioActual?.email}</p>
            </div>
          </div>
          <button className="btn-salir" onClick={onLogout}>Salir</button>
        </div>
      </div>
    </>
  )
}
