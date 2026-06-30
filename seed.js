import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import crypto from 'crypto'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

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
