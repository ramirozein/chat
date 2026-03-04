/**
 * Utilidades compartidas de UI para componentes de chat.
 * Hoisted fuera de componentes para evitar re-recreación en cada render.
 * (Vercel rule: rendering-hoist-jsx, rerender-memo)
 */

export function obtenerIniciales(nombre: string): string {
  return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const COLORES_AVATAR = [
  '#FF6B2C', '#F87171', '#A78BFA', '#22D3EE',
  '#34D399', '#FBBF24', '#F472B6', '#818CF8',
] as const

export function obtenerColorAvatar(nombre: string): string {
  return COLORES_AVATAR[nombre.charCodeAt(0) % COLORES_AVATAR.length]
}

export const BOT_EMAIL = 'bot@chatbot.ia'

export function esConversacionBot(
  participantes: { usuario: { email: string } }[],
): boolean {
  return participantes.some(p => p.usuario.email === BOT_EMAIL)
}