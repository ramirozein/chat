'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contextos/AuthContexto'

export default function PaginaLogin() {
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCargando(true)

    const resultado = await login(email, contrasena)

    if (resultado.ok) {
      router.push('/chat')
    } else {
      setError(resultado.error || 'Error al iniciar sesión')
    }

    setCargando(false)
  }

  return (
    <>
      <style jsx>{`
        .login-container {
          display: flex;
          min-height: 100vh;
          background: var(--color-fondo);
        }
        .login-branding {
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
          right: -10%;
          background: #FF6B2C;
        }
        .glow-2 {
          bottom: -20%;
          left: -10%;
          background: #FF8F5C;
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
        .login-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: var(--color-fondo-elevado);
          border-left: 1px solid var(--color-borde);
        }
        .login-form-wrapper {
          width: 100%;
          max-width: 420px;
          animation: slideUp 0.6s ease-out;
        }
        .login-form-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: var(--color-texto);
          margin: 0 0 0.5rem;
          letter-spacing: -0.01em;
        }
        .login-form-desc {
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
          .login-container {
            flex-direction: column;
          }
          .login-branding {
            padding: 2.5rem 1.5rem;
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
          .login-form-side {
            padding: 2rem 1.5rem;
            border-left: none;
            border-top: 1px solid var(--color-borde);
          }
          .login-form-title {
            font-size: 1.4rem;
          }
          .login-form-desc {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-branding">
          <div className="branding-glow glow-1" />
          <div className="branding-glow glow-2" />
          <div className="branding-content">
            <div className="branding-icon">💬</div>
            <h1 className="branding-title">Bienvenido <span>de vuelta</span></h1>
            <p className="branding-subtitle">
              Conéctate con tus amigos y compañeros en tiempo real con mensajes cifrados de extremo a extremo.
            </p>
          </div>
        </div>

        <div className="login-form-side">
          <div className="login-form-wrapper">
            <h2 className="login-form-title">Iniciar Sesión</h2>
            <p className="login-form-desc">Ingresa tus credenciales para acceder</p>

            <form onSubmit={manejarSubmit}>
              {error && <div className="form-error">{error}</div>}

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
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={e => setContrasena(e.target.value)}
                  required
                />
              </div>

              <button
                id="btn-login"
                type="submit"
                className="form-button"
                disabled={cargando}
              >
                {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>

              <p className="form-footer">
                ¿No tienes cuenta?{' '}
                <a href="/registro">Regístrate aquí</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
