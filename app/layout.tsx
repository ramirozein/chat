import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import ViewportHandler from '@/componentes/ViewportHandler'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chat App',
  description: 'Aplicación de chat en tiempo real',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Chat App',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0B0B12',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ViewportHandler />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
