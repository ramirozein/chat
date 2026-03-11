import { NextRequest, NextResponse } from 'next/server'

// Rutas que requieren autenticación
const RUTAS_PROTEGIDAS = ['/chat']
// Rutas solo para usuarios NO autenticados
const RUTAS_PUBLICAS = ['/login', '/registro']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const ruta = request.nextUrl.pathname

  // Los endpoints móviles manejan su propia autenticación por Bearer token
  if (ruta.startsWith('/api/movil')) {
    return NextResponse.next()
  }

  const esRutaProtegida = RUTAS_PROTEGIDAS.some(r => ruta.startsWith(r))
  const esRutaPublica = RUTAS_PUBLICAS.some(r => ruta.startsWith(r))

  // Si intenta acceder a ruta protegida sin token → redirigir a login
  if (esRutaProtegida && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si ya tiene token e intenta ir a login/registro → redirigir a chat
  if (esRutaPublica && token) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/chat/:path*', '/login', '/registro'],
}
