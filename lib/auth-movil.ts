import { NextRequest, NextResponse } from 'next/server'
import { verificarToken, type PayloadToken } from './auth'

/**
 * Resultado de la verificación del token móvil.
 * Si es exitoso, contiene el payload. Si no, contiene la respuesta de error.
 */
type ResultadoAuth =
  | { exito: true; payload: PayloadToken }
  | { exito: false; respuesta: NextResponse }

/**
 * Extrae y verifica el Bearer token del header Authorization.
 * Diseñado para endpoints móviles que no usan cookies.
 *
 * Uso:
 * ```ts
 * const auth = verificarTokenMovil(request)
 * if (!auth.exito) return auth.respuesta
 * const { payload } = auth // payload.usuarioId, payload.email
 * ```
 */
export function verificarTokenMovil(request: NextRequest): ResultadoAuth {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      exito: false,
      respuesta: NextResponse.json(
        { error: 'Token de autorización requerido. Usa el header: Authorization: Bearer <token>' },
        { status: 401 }
      ),
    }
  }

  const token = authHeader.substring(7) // Quitar "Bearer "

  const payload = verificarToken(token)
  if (!payload) {
    return {
      exito: false,
      respuesta: NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      ),
    }
  }

  return { exito: true, payload }
}
