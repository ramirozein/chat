import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarTokenMovil } from '@/lib/auth-movil'

const BOT_EMAIL = 'bot@chatbot.ia'

// Buscar usuarios por nombre o email para iniciar conversaciones
export async function GET(request: NextRequest) {
  try {
    const auth = verificarTokenMovil(request)
    if (!auth.exito) return auth.respuesta

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.trim().length < 2) {
      return NextResponse.json(
        { error: 'El parámetro de búsqueda (q) debe tener al menos 2 caracteres' },
        { status: 400 }
      )
    }

    const usuarios = await prisma.usuario.findMany({
      where: {
        AND: [
          {
            OR: [
              { nombre: { contains: q.trim(), mode: 'insensitive' } },
              { email: { contains: q.trim(), mode: 'insensitive' } },
            ],
          },
          // Excluir al usuario autenticado y al bot
          { id: { not: auth.payload.usuarioId } },
          { email: { not: BOT_EMAIL } },
        ],
      },
      select: { id: true, nombre: true, email: true, fotoPerfil: true },
      take: 20,
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({ usuarios })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
