'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contextos/AuthContexto'

export default function PaginaRegistro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { registrar } = useAuth()
  const router = useRouter()

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setCargando(true)
    const resultado = await registrar(nombre, email, contrasena)

    if (resultado.ok) {
      router.push('/chat')
    } else {
      setError(resultado.error || 'Error al registrarse')
    }

    setCargando(false)
  }

  return (
    <>
      <style jsx>{`
        .registro-container {
          display: flex;
          min-height: var(--app-height, 100dvh);
          background: var(--color-fondo);
        }
        .registro-branding {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          position: relative;
          overflow: hidden;
          background: linear-gradient(160deg, #1A0E08 0%, #0B0B12 40%, #16162A 100%);
        }
        .branding-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
        }
        .glow-1 {
          top: -15%;
          left: -10%;
          background: #FF8F5C;
        }
        .glow-2 {
          bottom: -20%;
          right: -10%;
          background: #FF6B2C;
          opacity: 0.08;
        }
        .branding-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 400px;
          animation: slideUp 0.7s ease-out;
        }
        .branding-icon {
          width: 80px;
          height: 80px;
          background: var(--color-primario-suave);
          border-radius: var(--radio-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          margin: 0 auto 2rem;
          border: 1px solid var(--color-borde-activo);
          animation: gentleFloat 3s ease-in-out infinite;
        }
        .branding-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 1rem;
          line-height: 1.15;
          color: var(--color-texto);
          letter-spacing: -0.02em;
        }
        .branding-title span {
          background: linear-gradient(135deg, #FF6B2C, #FF8F5C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .branding-subtitle {
          font-size: 1.05rem;
          color: var(--color-texto-secundario);
          margin: 0;
          line-height: 1.7;
        }
        .registro-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: var(--color-fondo-elevado);
          border-left: 1px solid var(--color-borde);
        }
        .registro-form-wrapper {
          width: 100%;
          max-width: 420px;
          animation: slideUp 0.6s ease-out;
        }
        .registro-form-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: var(--color-texto);
          margin: 0 0 0.5rem;
          letter-spacing: -0.01em;
        }
        .registro-form-desc {
          font-size: 0.95rem;
          color: var(--color-texto-secundario);
          margin: 0 0 2.5rem;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-texto-secundario);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid var(--color-borde);
          border-radius: var(--radio-md);
          font-size: 0.95rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--color-texto);
          background: var(--color-superficie);
          outline: none;
          transition: all var(--transicion);
        }
        .form-input::placeholder {
          color: var(--color-texto-terciario);
        }
        .form-input:hover {
          border-color: var(--color-borde-hover);
        }
        .form-input:focus {
          border-color: var(--color-primario);
          background: var(--color-superficie-2);
          box-shadow: 0 0 0 3px var(--color-primario-suave);
        }
        .form-error {
          padding: 0.875rem 1rem;
          border-radius: var(--radio-md);
          background: var(--color-error-fondo);
          border: 1px solid var(--color-error-borde);
          color: var(--color-error);
          font-size: 0.85rem;
          text-align: center;
          margin-bottom: 1.25rem;
          animation: fadeIn 0.2s ease-out;
        }
        .form-button {
          width: 100%;
          padding: 0.9rem;
          border: none;
          border-radius: var(--radio-md);
          background: linear-gradient(135deg, #FF6B2C, #FF8F5C);
          color: #FFFFFF;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
          box-shadow: var(--sombra-primario);
          margin-top: 0.75rem;
          letter-spacing: 0.01em;
        }
        .form-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(255, 107, 44, 0.35);
        }
        .form-button:active {
          transform: translateY(0);
        }
        .form-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .form-footer {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.875rem;
          color: var(--color-texto-secundario);
        }
        .form-footer a {
          color: var(--color-primario);
          font-weight: 600;
          text-decoration: none;
          transition: color var(--transicion);
        }
        .form-footer a:hover {
          color: var(--color-primario-hover);
        }
        @media (max-width: 768px) {
          .registro-container {
            flex-direction: column;
            min-height: var(--app-height, 100dvh);
          }
          .registro-branding {
            padding: 2rem 1.5rem;
            min-height: auto;
          }
          .branding-title {
            font-size: 1.75rem;
          }
          .branding-subtitle {
            font-size: 0.9rem;
          }
          .branding-icon {
            width: 60px;
            height: 60px;
            font-size: 1.75rem;
            margin-bottom: 1.25rem;
          }
          .registro-form-side {
            padding: 2rem 1.5rem;
            border-left: none;
            border-top: 1px solid var(--color-borde);
            flex: 1;
          }
          .registro-form-title {
            font-size: 1.4rem;
          }
          .registro-form-desc {
            margin-bottom: 1.5rem;
          }
        }
        @media (max-height: 500px) and (max-width: 768px) {
          .registro-branding {
            display: none;
          }
          .registro-form-side {
            border-top: none;
          }
        }
      `}</style>

      <div className="registro-container">
        <div className="registro-branding">
          <div className="branding-glow glow-1" />
          <div className="branding-glow glow-2" />
          <div className="branding-content">
            <div className="branding-icon">✨</div>
            <h1 className="branding-title">Únete a la <span>conversación</span></h1>
            <p className="branding-subtitle">
              Crea tu cuenta gratis y comienza a chatear con tus amigos de forma segura y en tiempo real.
            </p>
          </div>
        </div>

        <div className="registro-form-side">
          <div className="registro-form-wrapper">
            <h2 className="registro-form-title">Crear Cuenta</h2>
            <p className="registro-form-desc">Completa tus datos para registrarte</p>

            <form onSubmit={manejarSubmit}>
              {error && <div className="form-error">{error}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  className="form-input"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contrasena">Contraseña</label>
                <input
                  id="contrasena"
                  type="password"
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  value={contrasena}
                  onChange={e => setContrasena(e.target.value)}
                  required
                />
              </div>

              <button
                id="btn-registro"
                type="submit"
                className="form-button"
                disabled={cargando}
              >
                {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>

              <p className="form-footer">
                ¿Ya tienes cuenta?{' '}
                <a href="/login">Inicia Sesión</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
