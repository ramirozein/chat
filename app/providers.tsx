'use client'

import { ThemeProvider } from 'next-themes'
import { HeroUIProvider } from '@heroui/react'
import { AuthProvider } from '@/contextos/AuthContexto'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      themes={['dark', 'light']}
      enableSystem={false}
    >
      <HeroUIProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </HeroUIProvider>
    </ThemeProvider>
  )
}
