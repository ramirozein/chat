import { NextResponse } from 'next/server'

// Cerrar sesión eliminando la cookie del token
export async function POST() {
  const respuesta = NextResponse.json({ mensaje: 'Sesión cerrada' })

  respuesta.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return respuesta
}
