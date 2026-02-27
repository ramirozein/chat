'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Usuario {
  id: string
  nombre: string
  email: string
}

interface AuthContextoTipo {
  usuario: Usuario | null
  cargando: boolean
  login: (email: string, contrasena: string) => Promise<{ ok: boolean; error?: string }>
  registrar: (nombre: string, email: string, contrasena: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContexto = createContext<AuthContextoTipo | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  // Obtener usuario actual al cargar
  useEffect(() => {
    obtenerUsuario()
  }, [])

  async function obtenerUsuario() {
    try {
      const res = await fetch('/api/auth/yo')
      if (res.ok) {
        const data = await res.json()
        setUsuario(data.usuario)
      }
    } catch {
      // No autenticado
    } finally {
      setCargando(false)
    }
  }

  async function login(email: string, contrasena: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { ok: false, error: data.error }
      }

      setUsuario(data.usuario)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Error de conexión' }
    }
  }

  async function registrar(nombre: string, email: string, contrasena: string) {
    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, contrasena }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { ok: false, error: data.error }
      }

      setUsuario(data.usuario)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Error de conexión' }
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUsuario(null)
    window.location.href = '/login'
  }

  return (
    <AuthContexto.Provider value={{ usuario, cargando, login, registrar, logout }}>
      {children}
    </AuthContexto.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContexto)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return contexto
}
