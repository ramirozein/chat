import sharp from 'sharp'

const MAX_DIMENSION = 512
const CALIDAD_PNG = 80

/**
 * Comprime y redimensiona una imagen a un máximo de 512x512 px en formato PNG.
 * Mantiene la relación de aspecto. El resultado típico es ~50-100KB.
 */
export async function comprimirImagen(buffer: Buffer): Promise<Buffer> {
  const resultado = await sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png({
      compressionLevel: 9,
      quality: CALIDAD_PNG,
    })
    .toBuffer()

  return resultado
}
