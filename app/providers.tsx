'use client'

import { HeroUIProvider } from '@heroui/react'
import { AuthProvider } from '@/contextos/AuthContexto'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </HeroUIProvider>
  )
}
