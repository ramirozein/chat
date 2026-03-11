'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contextos/AuthContexto'

export default function PaginaInicio() {
  const { usuario, cargando } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!cargando) {
      router.replace(usuario ? '/chat' : '/login')
    }
  }, [usuario, cargando, router])

  return (
    <>
      <style jsx>{`
        .loading-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: var(--app-height, 100dvh);
          background: var(--color-fondo);
        }
        .spinner-ring {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-superficie-3);
          border-top-color: var(--color-primario);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
      `}</style>
      <div className="loading-page">
        <div className="spinner-ring" />
      </div>
    </>
  )
}
