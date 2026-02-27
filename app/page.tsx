'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contextos/AuthContexto'
import { Spinner } from '@heroui/react'

export default function PaginaInicio() {
  const { usuario, cargando } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!cargando) {
      router.replace(usuario ? '/chat' : '/login')
    }
  }, [usuario, cargando, router])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}>
      <Spinner size="lg" color="primary" />
    </div>
  )
}
