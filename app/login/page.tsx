'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contextos/AuthContexto'
import { useTheme } from 'next-themes'

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
      {mounted && (
        <button
          className="theme-toggle auth-theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Cambiar tema"
          title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      )}

      <div className="auth-container">
        <div className="auth-branding">
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
