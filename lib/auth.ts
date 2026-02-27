import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta-por-defecto'

export interface PayloadToken {
  usuarioId: string
  email: string
}

// Hashear contraseña con bcrypt (10 rondas de sal)
export async function hashContrasena(contrasena: string): Promise<string> {
  return bcrypt.hash(contrasena, 10)
}

// Verificar contraseña contra el hash almacenado
export async function verificarContrasena(contrasena: string, hash: string): Promise<boolean> {
  return bcrypt.compare(contrasena, hash)
}

// Generar token JWT con expiración de 7 días
export function generarToken(payload: PayloadToken): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// Verificar y decodificar token JWT
export function verificarToken(token: string): PayloadToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as PayloadToken
  } catch {
    return null
  }
}
