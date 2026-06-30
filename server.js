import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] } })
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw + 'premium-rewards-salt').digest('hex')
}

io.on('connection', (socket) => {
  console.log('Admin connected:', socket.id)
  socket.on('disconnect', () => console.log('Admin disconnected:', socket.id))
})

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ status: 'error', message: 'Fill all fields.' })
  try {
    const user = await prisma.adminUser.findUnique({ where: { username } })
    if (!user || user.password !== hashPassword(password))
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' })
    const token = crypto.randomBytes(32).toString('hex')
    res.json({ status: 'success', token })
  } catch {
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
    const allowed = ['claim_mode', 'redirect_url']
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        await prisma.setting.upsert({
          where: { key },
          update: { value: String(req.body[key]) },
          create: { key, value: String(req.body[key]) },
        })
      }
    }
    const rows = await prisma.setting.findMany()
    const settings = {}
    rows.forEach(r => settings[r.key] = r.value)
    io.emit('settings:updated', settings)
    res.json({ status: 'success', message: 'Saved.' })
  } catch { res.status(500).json({ status: 'error', message: 'Failed to save.' }) }
})

function mapReward(r) {
  return { id: String(r.id), reward_id: r.rewardId, image_url: r.imageUrl, slot_id: r.slotId }
}

async function getRewardRows() {
  return prisma.reward.findMany({ orderBy: [{ slotId: 'asc' }, { id: 'asc' }] })
}

async function getCachedRewards(options) {
  const rows = await getRewardRows(options)
  return rows.map(mapReward)
}

async function ensureFallbackSlots() {
  for (let i = 1; i <= 6; i += 1) {
    const id = `admin-slot-${i}`
    const existing = await prisma.reward.findFirst({ where: { slotId: String(i) } })
    if (!existing) await prisma.reward.create({ data: { rewardId: id, slotId: String(i), imageUrl: '' } })
  }
  return getCachedRewards()
}

app.get('/api/rewards', async (req, res) => {
  try {
    let rewards = await getCachedRewards()
    if (!rewards.length) rewards = await ensureFallbackSlots()
    res.json({ status: 'success', rewards })
  } catch { res.status(500).json({ status: 'error', message: 'Failed.' }) }
})

app.get('/api/admin/rewards', async (req, res) => {
  try {
    let rewards = await getCachedRewards()
    if (!rewards.length) rewards = await ensureFallbackSlots()
    res.json({ status: 'success', rewards })
  } catch { res.status(500).json({ status: 'error', message: 'Failed.' }) }
})

app.put('/api/admin/rewards/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const imageUrl = req.body.image_url === null ? '' : String(req.body.image_url || '')
    const slotId = String(req.body.slot_id || '')
    const existing = await prisma.reward.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ status: 'error', message: 'Reward not found.' })
    await prisma.reward.update({
      where: { id: existing.id },
      data: { imageUrl, slotId: slotId || existing.slotId },
    })
    const rewards = await getCachedRewards()
    io.emit('rewards:updated', rewards)
    res.json({ status: 'success', rewards: await getCachedRewards() })
  } catch { res.status(500).json({ status: 'error', message: 'Failed to update reward.' }) }
})

app.delete('/api/admin/rewards/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const existing = await prisma.reward.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ status: 'error', message: 'Reward not found.' })
    await prisma.reward.update({ where: { id: existing.id }, data: { imageUrl: '' } })
    const rewards = await getCachedRewards()
    io.emit('rewards:updated', rewards)
    res.json({ status: 'success', rewards: await getCachedRewards() })
  } catch { res.status(500).json({ status: 'error', message: 'Failed to delete reward image.' }) }
})

const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath)
  next()
})

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
