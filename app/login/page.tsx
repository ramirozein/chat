'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contextos/AuthContexto'
import { useTheme } from 'next-themes'
import { MessageSquare, Sun, Moon } from 'lucide-react'

export default function PaginaLogin() {
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
        .auth-container {
          display: flex;
          min-height: var(--app-height, 100dvh);
          background: var(--color-fondo);
        }
        
        .auth-branding {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          position: relative;
          overflow: hidden;
          background: var(--gradiente-branding);
          border-right: 1px solid var(--color-borde);
        }
        
        .branding-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.15;
          pointer-events: none;
        }
        
        .glow-1 {
          top: -20%;
          right: -15%;
          background: var(--gradiente-glow-1);
        }
        
        .glow-2 {
          bottom: -20%;
          left: -15%;
          background: var(--gradiente-glow-2);
          opacity: 0.1;
        }
        
        .branding-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 440px;
          animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        
        .branding-icon-container {
          width: 88px;
          height: 88px;
          background: var(--color-primario-suave);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2.5rem;
          border: 1px solid var(--color-primario-contenedor);
          box-shadow: var(--sombra-glow);
          animation: gentleFloat 4s ease-in-out infinite;
        }
        
        .branding-title {
          font-size: 3rem;
          font-weight: 800;
          margin: 0 0 1.25rem;
          line-height: 1.1;
          color: var(--color-texto);
          letter-spacing: -0.03em;
        }
        
        .branding-title span {
          background: linear-gradient(135deg, var(--color-primario), #ff9f75);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .branding-subtitle {
          font-size: 1.15rem;
          color: var(--color-texto-secundario);
          margin: 0;
          line-height: 1.6;
          font-weight: 400;
        }
        
        .auth-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: var(--color-fondo-elevado);
        }
        
        .auth-form-wrapper {
          width: 100%;
          max-width: 440px;
          animation: slideInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
          background: var(--color-superficie);
          padding: 3rem;
          border-radius: 32px;
          border: 1px solid var(--color-borde);
          box-shadow: var(--sombra-lg);
          var(--blur-lg);
        }
        
        .auth-form-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-texto);
          margin: 0 0 0.5rem;
          letter-spacing: -0.02em;
        }
        
        .auth-form-desc {
          font-size: 1rem;
          color: var(--color-texto-secundario);
          margin: 0 0 2.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-texto-secundario);
          margin-bottom: 0.6rem;
          letter-spacing: 0.02em;
        }
        
        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid var(--color-borde);
          border-radius: 20px;
          font-size: 1rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--color-texto);
          background: var(--color-fondo);
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
          background: var(--color-fondo-elevado);
          box-shadow: 0 0 0 4px var(--color-primario-suave);
        }
        
        .form-error {
          padding: 1rem 1.25rem;
          border-radius: 16px;
          background: var(--color-error-fondo);
          border: 1px solid var(--color-error-borde);
          color: var(--color-error);
          font-size: 0.9rem;
          text-align: center;
          margin-bottom: 1.5rem;
          font-weight: 500;
          animation: fadeIn 0.3s ease-out;
        }
        
        .form-button {
          width: 100%;
          padding: 1.1rem;
          border: none;
          border-radius: 20px;
          background: linear-gradient(135deg, var(--color-primario), #ff8a4f);
          color: #FFFFFF;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
          box-shadow: var(--sombra-primario);
          margin-top: 1rem;
          letter-spacing: 0.02em;
        }
        
        .form-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -6px rgba(255, 107, 44, 0.45);
        }
        
        .form-button:active {
          transform: translateY(1px);
        }
        
        .form-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .form-footer {
          text-align: center;
          margin-top: 2.5rem;
          font-size: 0.95rem;
          color: var(--color-texto-secundario);
        }
        
        .form-footer a {
          color: var(--color-primario);
          font-weight: 700;
          text-decoration: none;
          transition: all var(--transicion);
          margin-left: 0.25rem;
        }
        
        .form-footer a:hover {
          color: var(--color-primario-hover);
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .auth-theme-toggle {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 50;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          box-shadow: var(--sombra-sm);
          var(--blur-md);
        }
        
        @media (max-width: 992px) {
          .auth-form-wrapper {
            padding: 2.5rem;
          }
          .branding-title {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .auth-container {
            flex-direction: column;
            min-height: auto;
            overflow-y: auto;
          }
          .auth-branding {
            padding: 3rem 1.5rem;
            min-height: auto;
            flex: none;
            border-right: none;
            border-bottom: 1px solid var(--color-borde);
          }
          .branding-title {
            font-size: 2.25rem;
          }
          .branding-subtitle {
            font-size: 1rem;
          }
          .branding-icon-container {
            width: 72px;
            height: 72px;
            border-radius: 20px;
            margin-bottom: 1.5rem;
          }
          .auth-form-side {
            padding: 2rem 1.5rem;
            border-left: none;
            flex: none;
            background: var(--color-fondo);
          }
          .auth-form-wrapper {
            padding: 2rem 1.5rem;
            border: 1px solid var(--color-borde);
            box-shadow: var(--sombra-md);
          }
          .auth-form-title {
            font-size: 1.6rem;
          }
          .auth-theme-toggle {
            top: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
      {mounted && (
        <button
          className="theme-toggle auth-theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Cambiar tema"
          title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      )}

      <div className="auth-container">
        <div className="auth-branding">
          <div className="branding-glow glow-1" />
          <div className="branding-glow glow-2" />
          <div className="branding-content">
            <div className="branding-icon-container">
              <MessageSquare size={40} color="var(--color-primario)" strokeWidth={2.5} />
            </div>
            <h1 className="branding-title">Bienvenido <span>de vuelta</span></h1>
            <p className="branding-subtitle">
              Conéctate con tus amigos y compañeros en tiempo real con mensajes cifrados de extremo a extremo.
            </p>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-wrapper">
            <h2 className="auth-form-title">Iniciar Sesión</h2>
            <p className="auth-form-desc">Ingresa tus credenciales para acceder</p>

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
