import 'dotenv/config'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

const BOT_EMAIL = 'bot@chatbot.ia'
const BOT_NOMBRE = 'ChatBot IA'

async function main() {
  const existe = await prisma.usuario.findUnique({
    where: { email: BOT_EMAIL },
  })

  if (existe) {
    console.log('El usuario bot ya existe:', existe.id)
    return
  }

  const contrasena = await bcrypt.hash('bot-no-login-password', 10)

  const bot = await prisma.usuario.create({
    data: {
      nombre: BOT_NOMBRE,
      email: BOT_EMAIL,
      contrasena,
    },
  })

  console.log('Usuario bot creado:', bot.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
