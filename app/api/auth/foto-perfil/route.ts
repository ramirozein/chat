import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarToken } from '@/lib/auth'
import { comprimirImagen } from '@/lib/compresion-imagen'
import { subirImagen, eliminarImagen, obtenerNombreDeUrl } from '@/lib/gcs'

const MAX_TAMANO = 10 * 1024 * 1024 // 10MB

/**
 * Sanitiza el nombre del usuario para usarlo como nombre de archivo.
 * Elimina caracteres especiales, espacios y acentos.
 */
function sanitizarNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const payload = verificarToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const formData = await request.formData()
    const archivo = formData.get('foto') as File | null

    if (!archivo) {
      return NextResponse.json({ error: 'No se envió ninguna foto' }, { status: 400 })
    }

    if (!archivo.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 })
    }

    if (archivo.size > MAX_TAMANO) {
      return NextResponse.json({ error: 'La imagen es demasiado grande (máx. 10MB)' }, { status: 400 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.usuarioId },
      select: { id: true, nombre: true, fotoPerfil: true },
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const bufferOriginal = Buffer.from(await archivo.arrayBuffer())
    const bufferComprimido = await comprimirImagen(bufferOriginal)

    const nombreSanitizado = sanitizarNombre(usuario.nombre)
    const nombreArchivo = `${nombreSanitizado}FotoPerfil.png`

    if (usuario.fotoPerfil) {
      const nombreAnterior = obtenerNombreDeUrl(usuario.fotoPerfil)
      if (nombreAnterior) {
        await eliminarImagen(nombreAnterior)
      }
    }

    const urlFoto = await subirImagen(bufferComprimido, nombreArchivo)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { fotoPerfil: urlFoto },
    })

    return NextResponse.json({ fotoPerfil: urlFoto })
  } catch (error) {
    console.error('Error al subir foto de perfil:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
