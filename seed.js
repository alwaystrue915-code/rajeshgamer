import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw + 'premium-rewards-salt').digest('hex')
}

const username = process.env.ADMIN_USER || 'admin'
const password = process.env.ADMIN_PASS || 'admin123'

await prisma.adminUser.upsert({
  where: { username },
  update: { password: hashPassword(password) },
  create: { username, password: hashPassword(password) },
})

const defaults = { claim_mode: 'popup', redirect_url: '', popup_message: 'Reward claimed!' }
for (const [key, value] of Object.entries(defaults)) {
  await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } })
}

console.log('Seed complete.')
await prisma.$disconnect()
