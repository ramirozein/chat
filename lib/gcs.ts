import { Storage, type Bucket } from '@google-cloud/storage'

let _bucket: Bucket | null = null

/**
 * Inicialización lazy del bucket de GCS.
 * Solo se ejecuta cuando se llama una función, no al importar el módulo.
 * Esto evita errores durante `next build` en Docker donde GOOGLE_KEY no existe.
 */
function obtenerBucket(): Bucket {
  if (_bucket) return _bucket

  const base64 = process.env.GOOGLE_KEY
  if (!base64) {
    throw new Error('GOOGLE_KEY no está configurada en las variables de entorno')
  }

  const credenciales = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'))
  const storage = new Storage({
    projectId: credenciales.project_id,
    credentials: credenciales,
  })

  const bucketName = process.env.GCS_BUCKET_NAME || 'ubam-chat-fotos'
  _bucket = storage.bucket(bucketName)
  return _bucket
}

function obtenerNombreBucket(): string {
  return process.env.GCS_BUCKET_NAME || 'ubam-chat-fotos'
}

/**
 * Sube un buffer de imagen al bucket de GCS y devuelve la URL pública.
 */
export async function subirImagen(buffer: Buffer, nombreArchivo: string): Promise<string> {
  const bucket = obtenerBucket()
  const bucketName = obtenerNombreBucket()
  const archivo = bucket.file(`fotos-perfil/${nombreArchivo}`)

  await archivo.save(buffer, {
    metadata: {
      contentType: 'image/png',
      cacheControl: 'public, max-age=31536000',
    },
  })

  return `https://storage.googleapis.com/${bucketName}/fotos-perfil/${nombreArchivo}?v=${Date.now()}`
}

/**
 * Elimina una imagen del bucket de GCS (para reemplazos).
 */
export async function eliminarImagen(nombreArchivo: string): Promise<void> {
  try {
    const bucket = obtenerBucket()
    const archivo = bucket.file(`fotos-perfil/${nombreArchivo}`)
    await archivo.delete()
  } catch {
  }
}

/**
 * Extrae el nombre del archivo de una URL pública de GCS.
 */
export function obtenerNombreDeUrl(url: string): string | null {
  const bucketName = obtenerNombreBucket()
  const prefijo = `https://storage.googleapis.com/${bucketName}/fotos-perfil/`
  if (url.startsWith(prefijo)) {
    // Quitar query params (?v=...) del nombre
    const nombreConParams = url.substring(prefijo.length)
    return nombreConParams.split('?')[0]
  }
  return null
}
