'use client'

import { useState } from 'react'

interface Props {
  onEnviar: (contenido: string) => void
}

export default function EntradaMensaje({ onEnviar }: Props) {
  const [mensaje, setMensaje] = useState('')

  function manejarEnviar(e: React.FormEvent) {
    e.preventDefault()
    if (mensaje.trim()) {
      onEnviar(mensaje)
      setMensaje('')
    }
  }

  function manejarTecla(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      manejarEnviar(e)
    }
  }

  const tieneTexto = mensaje.trim().length > 0

  return (
    <>
      <style jsx>{`
        .entrada-wrapper {
          padding: 1rem 1.25rem;
          border-top: 1px solid #E2E8F0;
          background: #FFFFFF;
        }
        .entrada-form {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .entrada-input {
          flex: 1;
          padding: 0.875rem 1.125rem;
          border: 2px solid #E2E8F0;
          border-radius: 16px;
          font-size: 0.95rem;
          font-family: 'Inter', sans-serif;
          color: #1E293B;
          background: #F8FAFC;
          outline: none;
          transition: all 0.2s ease;
          min-width: 0;
        }
        .entrada-input::placeholder {
          color: #94A3B8;
        }
        .entrada-input:hover {
          border-color: #FDBA74;
        }
        .entrada-input:focus {
          border-color: #F97316;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }
        .entrada-btn {
          padding: 0.875rem 1.75rem;
          border: none;
          border-radius: 16px;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .entrada-btn.activo {
          background: linear-gradient(135deg, #F97316, #FB923C);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
        }
        .entrada-btn.activo:hover {
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
          transform: translateY(-1px);
        }
        .entrada-btn.inactivo {
          background: #E2E8F0;
          color: #94A3B8;
          cursor: default;
        }
      `}</style>

      <div className="entrada-wrapper">
        <form onSubmit={manejarEnviar} className="entrada-form">
          <input
            id="input-mensaje"
            className="entrada-input"
            placeholder="Escribe un mensaje..."
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            onKeyDown={manejarTecla}
          />
          <button
            id="btn-enviar"
            type="submit"
            className={`entrada-btn ${tieneTexto ? 'activo' : 'inactivo'}`}
            disabled={!tieneTexto}
          >
            Enviar
          </button>
        </form>
      </div>
    </>
  )
}
