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
  return prisma.reward.findMany({ orderBy: [{ slotId: 'asc' }, { id: 'asc' }], take: 6 })
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
    const rows = await prisma.setting.findMany()
    const settings = {}
    rows.forEach(r => settings[r.key] = r.value)
    res.json({ status: 'success', rewards, settings })
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

app.get('/api/admin/keys', async (req, res) => {
  try {
    const keys = await prisma.generatedKey.findMany({ orderBy: { createdAt: 'desc' } })
    res.json({ status: 'success', keys: keys.map(k => ({ id: String(k.id), key: k.key, device_id: k.deviceId || null, is_active: k.isActive, created_at: k.createdAt })) })
  } catch { res.status(500).json({ status: 'error', message: 'Failed to load keys.' }) }
})

app.post('/api/admin/keys', async (req, res) => {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let key = 'FF-'
    for (let i = 0; i < 3; i++) { for (let j = 0; j < 4; j++) key += chars[Math.floor(Math.random() * chars.length)]; if (i < 2) key += '-' }
    await prisma.generatedKey.create({ data: { key } })
    const keys = await prisma.generatedKey.findMany({ orderBy: { createdAt: 'desc' } })
    io.emit('keys:updated')
    res.json({ status: 'success', keys: keys.map(k => ({ id: String(k.id), key: k.key, device_id: k.deviceId || null, is_active: k.isActive, created_at: k.createdAt })) })
  } catch { res.status(500).json({ status: 'error', message: 'Failed to generate key.' }) }
})

app.put('/api/admin/keys/:id/toggle', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const existing = await prisma.generatedKey.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ status: 'error', message: 'Key not found.' })
    await prisma.generatedKey.update({ where: { id }, data: { isActive: !existing.isActive } })
    const keys = await prisma.generatedKey.findMany({ orderBy: { createdAt: 'desc' } })
    io.emit('keys:updated')
    res.json({ status: 'success', keys: keys.map(k => ({ id: String(k.id), key: k.key, device_id: k.deviceId || null, is_active: k.isActive, created_at: k.createdAt })) })
  } catch { res.status(500).json({ status: 'error', message: 'Failed to toggle key.' }) }
})

app.delete('/api/admin/keys/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.generatedKey.delete({ where: { id } })
    const keys = await prisma.generatedKey.findMany({ orderBy: { createdAt: 'desc' } })
    io.emit('keys:updated')
    res.json({ status: 'success', keys: keys.map(k => ({ id: String(k.id), key: k.key, device_id: k.deviceId || null, is_active: k.isActive, created_at: k.createdAt })) })
  } catch { res.status(500).json({ status: 'error', message: 'Failed to delete key.' }) }
})

app.post('/api/validate-key', async (req, res) => {
  try {
    const { key, device_id } = req.body
    if (!key || !device_id) return res.json({ status: 'error', message: 'Key and device ID required.' })
    const record = await prisma.generatedKey.findUnique({ where: { key: key.trim().toUpperCase() } })
    if (!record) return res.json({ status: 'error', message: 'Invalid key.' })
    if (!record.isActive) return res.json({ status: 'error', message: 'Key is deactivated.' })
    if (record.deviceId && record.deviceId !== device_id) return res.json({ status: 'error', message: 'Key already in use on another device.' })
    if (!record.deviceId) await prisma.generatedKey.update({ where: { id: record.id }, data: { deviceId: device_id } })
    res.json({ status: 'success', message: 'Access granted.' })
  } catch { res.json({ status: 'error', message: 'Validation failed.' }) }
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
