<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSocket } from '../composables/useSocket.js'
const socket = useSocket()
const UPLOAD_API = 'https://app.nexapk.in/api.php'
const API_KEY = 'yonogames-v2'
const rewards = ref([])
const loading = ref(true)
const error = ref('')
const toast = ref('')
const busySlots = ref({})
const uploadProgress = ref({})
let toastTimer = null
function showToast(msg) { toast.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.value = '', 3000) }

function normalizeUploadUrl(data) {
  const payload = data?.data && typeof data.data === 'object' ? data.data : data
  const raw = payload?.url || payload?.image_url || payload?.path || payload?.file || payload?.filename || payload?.name || ''
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  const file = String(raw).replace(/^\/+/, '').replace(/^uploads\/+/i, '')
  return `https://app.nexapk.in/uploads/${file}`
}

function uploadFileWithProgress(file, slotId) {
  return new Promise((resolve, reject) => {
    const fd = new FormData()
    fd.append('key', API_KEY)
    fd.append('image', file)
    uploadProgress.value = { ...uploadProgress.value, [slotId]: 1 }
    const xhr = new XMLHttpRequest()
    xhr.open('POST', UPLOAD_API)
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      const pct = Math.max(1, Math.min(99, Math.round((event.loaded / event.total) * 100)))
      uploadProgress.value = { ...uploadProgress.value, [slotId]: pct }
    }
    xhr.onerror = () => reject(new Error('Upload error'))
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || '{}')
        if (xhr.status < 200 || xhr.status >= 300 || data.success === false) {
          reject(new Error(data.error || data.message || 'Upload failed'))
          return
        }
        uploadProgress.value = { ...uploadProgress.value, [slotId]: 100 }
        resolve(data)
      } catch {
        reject(new Error('Invalid upload response'))
      }
    }
    xhr.send(fd)
  })
}

async function loadRewards(forceRefresh = false) {
  error.value = ''
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(`/api/admin/rewards${forceRefresh ? '?refresh=1' : ''}`, { cache: 'no-store', signal: controller.signal })
    const data = await res.json()
    if (data.status === 'success') {
      const raw = (data.rewards || []).filter(r => r?.id).slice(0, 6)
      rewards.value = raw
    } else {
      error.value = data.message || 'Rewards load nahi ho paaye.'
    }
  } catch {
    error.value = 'Rewards load nahi ho paaye.'
  } finally {
    clearTimeout(timeout)
    loading.value = false
  }
}

async function saveSlot(slot, imageUrl) {
  busySlots.value = { ...busySlots.value, [slot.id]: true }
  const previous = slot.image_url
  slot.image_url = imageUrl || ''
  try {
    const res = await fetch(`/api/admin/rewards/${encodeURIComponent(slot.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: slot.image_url, slot_id: slot.slot_id }),
    })
    const data = await res.json()
    if (data.status !== 'success') throw new Error(data.message || 'Failed')
    if (Array.isArray(data.rewards)) rewards.value = data.rewards.slice(0, 6)
    showToast(imageUrl ? 'Uploaded and saved!' : 'Image removed!')
  } catch {
    slot.image_url = previous
    showToast('Save failed')
  } finally {
    const next = { ...busySlots.value }
    delete next[slot.id]
    busySlots.value = next
    const progress = { ...uploadProgress.value }
    delete progress[slot.id]
    uploadProgress.value = progress
  }
}

async function removeSlotImage(slot) {
  busySlots.value = { ...busySlots.value, [slot.id]: true }
  const previous = slot.image_url
  slot.image_url = ''
  try {
    const res = await fetch(`/api/admin/rewards/${encodeURIComponent(slot.id)}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.status !== 'success') throw new Error(data.message || 'Failed')
    showToast('Image removed!')
  } catch {
    slot.image_url = previous
    showToast('Delete failed')
  } finally {
    const next = { ...busySlots.value }
    delete next[slot.id]
    busySlots.value = next
  }
}

function refreshRewards() {
  loadRewards()
}

onMounted(() => {
  loadRewards(true)
  socket.on('rewards:updated', refreshRewards)
})

onUnmounted(() => {
  socket.off('rewards:updated', refreshRewards)
})

function pickUpload(slot) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      busySlots.value = { ...busySlots.value, [slot.id]: true }
      const data = await uploadFileWithProgress(file, slot.id)
      const fullUrl = normalizeUploadUrl(data)
      if (!fullUrl) throw new Error('Upload link missing')
      await saveSlot(slot, fullUrl)
    } catch (err) {
      showToast(err?.message || 'Upload error')
      const next = { ...busySlots.value }
      delete next[slot.id]
      busySlots.value = next
      const progress = { ...uploadProgress.value }
      delete progress[slot.id]
      uploadProgress.value = progress
    }
  }
  input.click()
}

function deleteImg(slot) {
  if (busySlots.value[slot.id]) return
  removeSlotImage(slot)
}
</script>
<template>
  <div class="admin-page-toolbar">
    <div><h1>Rewards</h1><p class="subtitle">Manage slot images — tap to upload, delete to remove</p></div>
  </div>
  <div v-if="loading" class="slot-state">Loading rewards...</div>
  <div v-else-if="error" class="slot-state">
    <p>{{ error }}</p>
    <button class="admin-btn admin-btn-primary" @click="loading = true; loadRewards(true)">Retry</button>
  </div>
  <div v-else class="slot-grid">
    <div v-for="r in rewards" :key="r.id" class="slot-card" :class="{ busy: busySlots[r.id] }">
      <div class="slot-label">Slot {{ r.slot_id }}</div>
      <div class="slot-img-wrap" @click="pickUpload(r)">
        <img v-if="r.image_url" :src="r.image_url" :alt="'Slot ' + r.slot_id" loading="lazy">
        <div v-else class="slot-empty">No Image</div>
        <div class="slot-overlay" :class="{ visible: busySlots[r.id] }">
          <span>{{ uploadProgress[r.id] ? `Uploading ${uploadProgress[r.id]}%` : (busySlots[r.id] ? 'Saving...' : 'Tap to Upload') }}</span>
          <div v-if="uploadProgress[r.id]" class="slot-progress"><i :style="{ width: uploadProgress[r.id] + '%' }"></i></div>
        </div>
      </div>
      <button class="slot-delete" :disabled="busySlots[r.id] || !r.image_url" @click="deleteImg(r)">{{ busySlots[r.id] ? 'Saving...' : 'Delete' }}</button>
    </div>
    <div v-if="!rewards.length" class="slot-state">No rewards found</div>
  </div>
  <div v-if="toast" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:10px;background:#1c1c1e;color:#fff;font-size:14px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.3)">{{ toast }}</div>
</template>

<style scoped>
.slot-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(170px,1fr)); gap: 18px; }
.slot-state { min-height: 220px; display: grid; place-items: center; gap: 14px; color: var(--admin-text-secondary); text-align: center; padding: 34px; border: 1px dashed #d8dee9; border-radius: 18px; background: #fff; }
.slot-state p { margin: 0; font-weight: 800; }
.slot-card { width: auto; min-width: 0; border-radius: 18px; background: var(--admin-card); border: 1px solid var(--admin-border); overflow: hidden; box-shadow: var(--admin-shadow); transition: transform .2s ease,box-shadow .2s ease; }
.slot-card:hover { transform: translateY(-3px); box-shadow: var(--admin-shadow-lg); }
.slot-card.busy { pointer-events: none; opacity: .78; }
.slot-label { padding: 10px 12px 6px; font-size: 13px; font-weight: 700; color: var(--admin-text); }
.slot-img-wrap { position: relative; width: 100%; aspect-ratio: 1; cursor: pointer; overflow: hidden; background: #f0f0f0; }
.slot-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
.slot-empty { width: 100%; height: 100%; display: grid; place-items: center; color: var(--admin-text-secondary); font-size: 13px; font-weight: 800; background: repeating-linear-gradient(135deg,#f8fafc 0 12px,#eef2f7 12px 24px); }
.slot-overlay { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.45); opacity: 0; transition: opacity .2s; }
.slot-overlay span { color: #fff; font-size: 12px; font-weight: 600; background: rgba(0,0,0,.55); padding: 6px 14px; border-radius: 999px; }
.slot-overlay.visible,.slot-img-wrap:hover .slot-overlay { opacity: 1; }
.slot-progress { align-self: start; width: 72%; height: 7px; margin-top: -42px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.24); }
.slot-progress i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#44C965,#a7f3d0); transition: width .18s ease; }
.slot-delete { width: 100%; padding: 8px; border: 0; border-top: 1px solid var(--admin-border); font-size: 12px; font-weight: 600; color: var(--admin-red); background: transparent; cursor: pointer; }
.slot-delete:hover { background: rgba(255,59,48,.06); }
.slot-delete:disabled { color: #a6acba; cursor: not-allowed; background: #f7f8fb; }
@media (max-width:768px) {
  .slot-grid { gap: 10px; }
  .slot-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
}
</style>
