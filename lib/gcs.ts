import { Storage } from '@google-cloud/storage'

// Decodificar credenciales de GCS desde base64
function obtenerCredenciales() {
  const base64 = process.env.GOOGLE_KEY
  if (!base64) {
    throw new Error('GOOGLE_KEY no está configurada en las variables de entorno')
  }
  const json = Buffer.from(base64, 'base64').toString('utf-8')
  return JSON.parse(json)
}

const credenciales = obtenerCredenciales()

const storage = new Storage({
  projectId: credenciales.project_id,
  credentials: credenciales,
})

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'ubam-chat-fotos'
const bucket = storage.bucket(BUCKET_NAME)

/**
 * Sube un buffer de imagen al bucket de GCS y devuelve la URL pública.
 */
export async function subirImagen(buffer: Buffer, nombreArchivo: string): Promise<string> {
  const archivo = bucket.file(`fotos-perfil/${nombreArchivo}`)

  await archivo.save(buffer, {
    metadata: {
      contentType: 'image/png',
      cacheControl: 'public, max-age=31536000',
    },
  })

  return `https://storage.googleapis.com/${BUCKET_NAME}/fotos-perfil/${nombreArchivo}`
}

/**
 * Elimina una imagen del bucket de GCS (para reemplazos).
 */
export async function eliminarImagen(nombreArchivo: string): Promise<void> {
  try {
    const archivo = bucket.file(`fotos-perfil/${nombreArchivo}`)
    await archivo.delete()
  } catch {
    // Si el archivo no existe, ignorar el error
  }
}

/**
 * Extrae el nombre del archivo de una URL pública de GCS.
 */
export function obtenerNombreDeUrl(url: string): string | null {
  const prefijo = `https://storage.googleapis.com/${BUCKET_NAME}/fotos-perfil/`
  if (url.startsWith(prefijo)) {
    return url.substring(prefijo.length)
  }
  return null
}
