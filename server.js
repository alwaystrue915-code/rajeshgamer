import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw + 'premium-rewards-salt').digest('hex')
}

const PUBLIC_API = 'https://app.nexapk.in/rajesh/api.php'

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ status: 'error', message: 'Fill all fields.' })
  try {
    const user = await prisma.adminUser.findUnique({ where: { username } })
    if (!user || user.password !== hashPassword(password))
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' })
    const token = crypto.randomBytes(32).toString('hex')
    res.json({ status: 'success', token })
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Server error.' })
  }
})

app.get('/api/admin/session', (req, res) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ status: 'error', message: 'Unauthorized.' })
  res.json({ status: 'success', user: { username: 'admin' } })
})

app.get('/api/admin/settings', async (req, res) => {
  try {
    const rows = await prisma.setting.findMany()
    const settings = {}
    rows.forEach(r => settings[r.key] = r.value)
    res.json({ status: 'success', settings })
  } catch { res.status(500).json({ status: 'error', message: 'Failed to load settings.' }) }
})

app.put('/api/admin/settings', async (req, res) => {
  try {
    const allowed = ['claim_mode', 'redirect_url', 'popup_message']
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        await prisma.setting.upsert({
          where: { key },
          update: { value: String(req.body[key]) },
          create: { key, value: String(req.body[key]) },
        })
      }
    }
    res.json({ status: 'success', message: 'Saved.' })
  } catch { res.status(500).json({ status: 'error', message: 'Failed to save.' }) }
})

app.get('/api/rewards', async (req, res) => {
  try {
    const resp = await fetch(PUBLIC_API, { cache: 'no-store' })
    const data = await resp.json()
    if (data.status === 'success') {
      const rewards = (data.rewards || []).filter(r => r?.id)
      await prisma.reward.deleteMany()
      for (const r of rewards) {
        await prisma.reward.create({ data: { rewardId: String(r.id), imageUrl: r.image_url, slotId: String(r.slot_id) } })
      }
      return res.json({ status: 'success', rewards })
    }
    const cached = await prisma.reward.findMany()
    res.json({ status: 'success', rewards: cached.map(r => ({ id: r.rewardId, image_url: r.imageUrl, slot_id: r.slotId })) })
  } catch { res.status(500).json({ status: 'error', message: 'Failed.' }) }
})

const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath)
  next()
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
