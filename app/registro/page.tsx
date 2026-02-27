'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contextos/AuthContexto'
import { Input, Button, Card, CardBody, CardHeader, Link } from '@heroui/react'

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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '1rem',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--color-superficie)',
          border: '1px solid var(--color-borde)',
        }}
      >
        <CardHeader style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '2rem',
          paddingBottom: '0.5rem',
          gap: '0.5rem',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '0.5rem',
          }}>
            ✨
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Crear Cuenta</h1>
          <p style={{ color: 'var(--color-texto-secundario)', fontSize: '0.875rem', margin: 0 }}>
            Regístrate para comenzar a chatear
          </p>
        </CardHeader>
        <CardBody style={{ padding: '1.5rem 2rem 2rem' }}>
          <form onSubmit={manejarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--color-error)',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <Input
              id="nombre"
              type="text"
              label="Nombre"
              placeholder="Tu nombre"
              value={nombre}
              onValueChange={setNombre}
              variant="bordered"
              isRequired
            />

            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onValueChange={setEmail}
              variant="bordered"
              isRequired
            />

            <Input
              id="contrasena"
              type="password"
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              value={contrasena}
              onValueChange={setContrasena}
              variant="bordered"
              isRequired
            />

            <Button
              id="btn-registro"
              type="submit"
              color="primary"
              isLoading={cargando}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              }}
              size="lg"
            >
              Crear Cuenta
            </Button>

            <p style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--color-texto-secundario)',
              marginTop: '0.5rem',
            }}>
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" style={{ color: 'var(--color-acento)', fontWeight: '500' }}>
                Inicia Sesión
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
