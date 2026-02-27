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
          min-height: 100vh;
        }
        .registro-branding {
          flex: 1;
          background: linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FDBA74 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #FFFFFF;
          position: relative;
          overflow: hidden;
        }
        .registro-branding::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          border-radius: 50%;
        }
        .registro-branding::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 80%;
          height: 80%;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }
        .branding-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 400px;
        }
        .branding-icon {
          width: 80px;
          height: 80px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          margin: 0 auto 2rem;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .branding-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 1rem;
          line-height: 1.2;
        }
        .branding-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0;
          line-height: 1.6;
        }
        .registro-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: #FFFFFF;
        }
        .registro-form-wrapper {
          width: 100%;
          max-width: 420px;
          animation: slideUp 0.5s ease-out;
        }
        .registro-form-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1E293B;
          margin: 0 0 0.5rem;
        }
        .registro-form-desc {
          font-size: 1rem;
          color: #64748B;
          margin: 0 0 2.5rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 0.5rem;
        }
        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #E2E8F0;
          border-radius: 14px;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
          color: #1E293B;
          background: #F8FAFC;
          outline: none;
          transition: all 0.2s ease;
        }
        .form-input::placeholder {
          color: #94A3B8;
        }
        .form-input:hover {
          border-color: #FDBA74;
        }
        .form-input:focus {
          border-color: #F97316;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
        }
        .form-error {
          padding: 0.875rem 1rem;
          border-radius: 12px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          font-size: 0.875rem;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .form-button {
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #F97316, #FB923C);
          color: #FFFFFF;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
          margin-top: 0.5rem;
        }
        .form-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
        }
        .form-button:active {
          transform: translateY(0);
        }
        .form-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .form-footer {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #64748B;
        }
        .form-footer a {
          color: #F97316;
          font-weight: 600;
          text-decoration: none;
        }
        .form-footer a:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .registro-container {
            flex-direction: column;
          }
          .registro-branding {
            padding: 2.5rem 1.5rem;
            min-height: auto;
          }
          .branding-title {
            font-size: 1.75rem;
          }
          .branding-subtitle {
            font-size: 0.95rem;
          }
          .branding-icon {
            width: 60px;
            height: 60px;
            font-size: 1.75rem;
            margin-bottom: 1.25rem;
          }
          .registro-form-side {
            padding: 2rem 1.5rem;
          }
          .registro-form-title {
            font-size: 1.5rem;
          }
          .registro-form-desc {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>

      <div className="registro-container">
        {/* Lado branding */}
        <div className="registro-branding">
          <div className="branding-content">
            <div className="branding-icon">✨</div>
            <h1 className="branding-title">Únete a la conversación</h1>
            <p className="branding-subtitle">
              Crea tu cuenta gratis y comienza a chatear con tus amigos de forma segura y en tiempo real.
            </p>
          </div>
        </div>

        {/* Lado formulario */}
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
