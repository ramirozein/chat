'use client'

import { useState, useRef } from 'react'

interface Props {
  onEnviar: (contenido: string) => void
}

export default function EntradaMensaje({ onEnviar }: Props) {
  const [mensaje, setMensaje] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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

  function manejarFocus() {
    // En móvil, cuando el teclado se abre, hacer scroll para asegurar que el input sea visible
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 300)
  }

  const tieneTexto = mensaje.trim().length > 0

  return (
    <>
      <style jsx>{`
        .entrada-wrapper {
          padding: 0.75rem 1rem;
          padding-bottom: max(0.75rem, var(--safe-bottom, 0px));
          border-top: 1px solid var(--color-borde);
          background: var(--color-fondo-elevado);
          flex-shrink: 0;
        }
        .entrada-form {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .entrada-input {
          flex: 1;
          padding: 0.7rem 1rem;
          border: 1px solid var(--color-borde);
          border-radius: var(--radio-lg);
          font-size: 1rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--color-texto);
          background: var(--color-superficie);
          outline: none;
          transition: all var(--transicion);
          min-width: 0;
        }
        .entrada-input::placeholder {
          color: var(--color-texto-terciario);
        }
        .entrada-input:hover {
          border-color: var(--color-borde-hover);
        }
        .entrada-input:focus {
          border-color: var(--color-primario);
          box-shadow: 0 0 0 3px var(--color-primario-suave);
        }
        .entrada-btn {
          padding: 0.7rem 1.25rem;
          border: none;
          border-radius: var(--radio-lg);
          font-size: 0.88rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
          white-space: nowrap;
          flex-shrink: 0;
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .entrada-btn.activo {
          background: linear-gradient(135deg, #FF6B2C, #FF8F5C);
          color: #FFFFFF;
          box-shadow: var(--sombra-primario);
        }
        .entrada-btn.activo:hover {
          box-shadow: 0 4px 20px rgba(255, 107, 44, 0.4);
          transform: translateY(-1px);
        }
        .entrada-btn.activo:active {
          transform: scale(0.97);
        }
        .entrada-btn.inactivo {
          background: var(--color-superficie-2);
          color: var(--color-texto-terciario);
          cursor: default;
        }
        @media (max-width: 768px) {
          .entrada-wrapper {
            padding: 0.625rem 0.75rem;
            padding-bottom: max(0.625rem, var(--safe-bottom, 0px));
          }
          .entrada-btn {
            padding: 0.7rem 1rem;
          }
        }
      `}</style>

      <div className="entrada-wrapper">
        <form onSubmit={manejarEnviar} className="entrada-form">
          <input
            ref={inputRef}
            id="input-mensaje"
            className="entrada-input"
            placeholder="Escribe un mensaje..."
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            onKeyDown={manejarTecla}
            onFocus={manejarFocus}
            enterKeyHint="send"
            autoComplete="off"
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

