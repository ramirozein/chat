import crypto from 'crypto'

const ALGORITMO = 'aes-256-gcm'
const CLAVE_CIFRADO = process.env.CLAVE_CIFRADO || 'clave-cifrado-32chars-abcdefgh!'

// Derivar clave de 32 bytes a partir de la variable de entorno
function obtenerClave(): Buffer {
  return crypto.scryptSync(CLAVE_CIFRADO, 'sal-fija-chat-app', 32)
}

export interface MensajeCifrado {
  contenido: string // Texto cifrado en hex
  iv: string        // Vector de inicialización en hex
}

// Cifrar un mensaje con AES-256-GCM
export function cifrarMensaje(texto: string): MensajeCifrado {
  const clave = obtenerClave()
  const iv = crypto.randomBytes(16)
  const cifrador = crypto.createCipheriv(ALGORITMO, clave, iv)

  let cifrado = cifrador.update(texto, 'utf8', 'hex')
  cifrado += cifrador.final('hex')

  // Agregar el tag de autenticación al final del texto cifrado
  const tag = cifrador.getAuthTag()
  cifrado += tag.toString('hex')

  return {
    contenido: cifrado,
    iv: iv.toString('hex'),
  }
}

// Descifrar un mensaje cifrado con AES-256-GCM
export function descifrarMensaje(contenido: string, iv: string): string {
  const clave = obtenerClave()
  const ivBuffer = Buffer.from(iv, 'hex')

  // Separar el texto cifrado del tag de autenticación (últimos 32 chars hex = 16 bytes)
  const textoCifrado = contenido.slice(0, -32)
  const tag = Buffer.from(contenido.slice(-32), 'hex')

  const descifrador = crypto.createDecipheriv(ALGORITMO, clave, ivBuffer)
  descifrador.setAuthTag(tag)

  let descifrado = descifrador.update(textoCifrado, 'hex', 'utf8')
  descifrado += descifrador.final('utf8')

  return descifrado
}
