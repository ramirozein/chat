'use client'

import { useState, useRef } from 'react'
import { Send } from 'lucide-react'

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
          padding: 1rem 1.5rem;
          padding-bottom: max(1rem, calc(var(--safe-bottom, 0px) + 0.5rem));
          border-top: 1px solid var(--color-borde);
          background: var(--color-superficie);
          var(--blur-lg);
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }
        .entrada-form {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        .entrada-input {
          flex: 1;
          padding: 0.85rem 1.25rem;
          border: 1px solid var(--color-borde);
          border-radius: 24px;
          font-size: 1rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--color-texto);
          background: var(--color-fondo);
          outline: none;
          transition: all var(--transicion);
          min-width: 0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .entrada-input::placeholder {
          color: var(--color-texto-terciario);
        }
        .entrada-input:hover {
          border-color: var(--color-borde-hover);
        }
        .entrada-input:focus {
          border-color: var(--color-primario);
          box-shadow: 0 0 0 3px var(--color-primario-suave), inset 0 2px 4px rgba(0,0,0,0.02);
          background: var(--color-fondo-elevado);
        }
        .entrada-btn {
          padding: 0.85rem;
          border: none;
          border-radius: 50%;
          font-size: 0.88rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .entrada-btn.activo {
          background: linear-gradient(135deg, var(--color-primario), #ff8a4f);
          color: #FFFFFF;
          box-shadow: var(--sombra-primario);
        }
        .entrada-btn.activo:hover {
          box-shadow: 0 6px 20px rgba(255, 107, 44, 0.4);
          transform: translateY(-2px) scale(1.05);
        }
        .entrada-btn.activo:active {
          transform: scale(0.95);
        }
        .entrada-btn.inactivo {
          background: var(--color-superficie-2);
          color: var(--color-texto-terciario);
          cursor: not-allowed;
          opacity: 0.7;
        }
        @media (max-width: 768px) {
          .entrada-wrapper {
            padding: 0.75rem 1rem;
            padding-bottom: max(0.75rem, var(--safe-bottom, 0px));
          }
          .entrada-input {
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
          }
          .entrada-btn {
            width: 44px;
            height: 44px;
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
            aria-label="Enviar mensaje"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  )
}

