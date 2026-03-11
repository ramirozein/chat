'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contextos/AuthContexto'
import { useTheme } from 'next-themes'

export default function PaginaRegistro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { registrar } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
          <div className="branding-glow glow-1-alt" />
          <div className="branding-glow glow-2-alt" />
          <div className="branding-content">
            <div className="branding-icon">✨</div>
            <h1 className="branding-title">Únete a la <span>conversación</span></h1>
            <p className="branding-subtitle">
              Crea tu cuenta gratis y comienza a chatear con tus amigos de forma segura y en tiempo real.
            </p>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-wrapper">
            <h2 className="auth-form-title">Crear Cuenta</h2>
            <p className="auth-form-desc">Completa tus datos para registrarte</p>

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
