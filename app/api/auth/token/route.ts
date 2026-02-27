import { NextRequest, NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'

// Obtener el token JWT para autenticación de WebSocket
// Este endpoint devuelve el token si es válido
export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const payload = verificarToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  return NextResponse.json({ token })
}
