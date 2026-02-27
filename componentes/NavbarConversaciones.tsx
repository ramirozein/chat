'use client'

import { useState } from 'react'
import { Input, Button, Divider } from '@heroui/react'

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

  // Obtener nombre del otro participante
  function obtenerNombreContacto(conversacion: Conversacion): string {
    const otro = conversacion.participantes.find(
      p => p.usuario.id !== usuarioActual?.id
    )
    return otro?.usuario.nombre || 'Desconocido'
  }

  function obtenerIniciales(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Cabecera */}
      <div style={{
        padding: '1.25rem',
        borderBottom: '1px solid var(--color-borde)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            💬 Chats
          </h2>
          <Button
            id="btn-nuevo-chat"
            size="sm"
            variant="flat"
            color="primary"
            onPress={() => setMostrarFormulario(!mostrarFormulario)}
            style={{ minWidth: 'auto', fontWeight: '600' }}
          >
            + Nuevo
          </Button>
        </div>

        {/* Formulario para nueva conversación */}
        {mostrarFormulario && (
          <form onSubmit={manejarCrear} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginTop: '0.5rem',
          }}>
            <Input
              id="email-nuevo-chat"
              size="sm"
              placeholder="Email del contacto"
              value={emailNuevo}
              onValueChange={setEmailNuevo}
              variant="bordered"
            />
            {errorNuevo && (
              <p style={{
                color: 'var(--color-error)',
                fontSize: '0.75rem',
                margin: 0,
              }}>
                {errorNuevo}
              </p>
            )}
            <Button
              id="btn-crear-chat"
              size="sm"
              type="submit"
              color="primary"
              isLoading={creando}
              style={{ fontWeight: '600' }}
            >
              Iniciar Chat
            </Button>
          </form>
        )}
      </div>

      {/* Lista de conversaciones */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.5rem',
      }}>
        {conversaciones.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--color-texto-secundario)',
            fontSize: '0.875rem',
            textAlign: 'center',
            padding: '2rem',
          }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗨️</p>
            <p>No tienes conversaciones aún</p>
            <p style={{ fontSize: '0.75rem' }}>Presiona "+ Nuevo" para chatear</p>
          </div>
        ) : (
          conversaciones.map(conv => {
            const nombre = obtenerNombreContacto(conv)
            const activa = conv.id === conversacionActiva

            return (
              <button
                key={conv.id}
                onClick={() => onSeleccionar(conv.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activa ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  transition: 'background-color 0.2s',
                  textAlign: 'left',
                  color: 'var(--color-texto)',
                  marginBottom: '0.25rem',
                }}
                onMouseEnter={e => {
                  if (!activa) e.currentTarget.style.backgroundColor = 'var(--color-superficie-2)'
                }}
                onMouseLeave={e => {
                  if (!activa) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '42px',
                  height: '42px',
                  minWidth: '42px',
                  borderRadius: '12px',
                  background: activa
                    ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                    : 'var(--color-superficie-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: activa ? '#fff' : 'var(--color-texto-secundario)',
                }}>
                  {obtenerIniciales(nombre)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontWeight: activa ? '600' : '500',
                    fontSize: '0.9rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {nombre}
                  </p>
                </div>

                {/* Indicador activo */}
                {activa && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-acento)',
                  }} />
                )}
              </button>
            )
          })
        )}
      </div>

      <Divider style={{ backgroundColor: 'var(--color-borde)' }} />

      {/* Pie con info del usuario */}
      <div style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            margin: 0,
            fontWeight: '600',
            fontSize: '0.85rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {usuarioActual?.nombre}
          </p>
          <p style={{
            margin: 0,
            color: 'var(--color-texto-secundario)',
            fontSize: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {usuarioActual?.email}
          </p>
        </div>
        <Button
          id="btn-logout"
          size="sm"
          variant="light"
          color="danger"
          onPress={onLogout}
          style={{ minWidth: 'auto' }}
        >
          Salir
        </Button>
      </div>
    </div>
  )
}
