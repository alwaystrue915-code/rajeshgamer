<script setup>
import { ref, onMounted } from 'vue'
const UPLOAD_API = 'https://app.nexapk.in/api.php'
const API_KEY = 'yonogames-v2'
const rewards = ref([])
const loading = ref(true)
const toast = ref('')
let toastTimer = null
function showToast(msg) { toast.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.value = '', 3000) }

onMounted(async () => {
  try {
    const res = await fetch('/api/rewards', { cache: 'no-store' })
    const data = await res.json()
    if (data.status === 'success') {
      const raw = (data.rewards || []).filter(r => r?.id)
      raw.forEach(r => r.adminImage = null)
      rewards.value = raw
    }
  } catch {} finally { loading.value = false }
})

function pickUpload(slot) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('key', API_KEY)
    fd.append('image', file)
    try {
      const res = await fetch(UPLOAD_API, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        slot.adminImage = data.url
        showToast('Uploaded!')
      } else showToast(data.error || 'Failed')
    } catch { showToast('Upload error') }
  }
  input.click()
}

function deleteImg(slot) {
  slot.adminImage = null
  showToast('Removed')
}
</script>
<template>
  <div style="display:flex;align-items:center;justify-content:space-between">
    <div><h1>Rewards</h1><p class="subtitle">Manage slot images — tap to upload, delete to remove</p></div>
  </div>
  <div v-if="loading" style="color:var(--admin-text-secondary);padding:40px 0">Loading...</div>
  <div v-else class="slot-grid">
    <div v-for="r in rewards" :key="r.id" class="slot-card">
      <div class="slot-label">Slot {{ r.slot_id }}</div>
      <div class="slot-img-wrap" @click="pickUpload(r)">
        <img :src="r.adminImage || r.image_url" :alt="'Slot ' + r.slot_id" loading="lazy">
        <div class="slot-overlay"><span>Tap to Upload</span></div>
      </div>
      <button class="slot-delete" @click="deleteImg(r)">Delete</button>
    </div>
    <div v-if="!rewards.length" style="color:var(--admin-text-secondary);padding:40px;text-align:center">No rewards found</div>
  </div>
  <div v-if="toast" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:10px;background:#1c1c1e;color:#fff;font-size:14px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.3)">{{ toast }}</div>
</template>

<style scoped>
.slot-grid { display: flex; flex-wrap: wrap; gap: 16px; }
.slot-card { flex: 0 0 auto; width: 160px; border-radius: 14px; background: var(--admin-card); border: 1px solid var(--admin-border); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
.slot-label { padding: 10px 12px 6px; font-size: 13px; font-weight: 700; color: var(--admin-text); }
.slot-img-wrap { position: relative; width: 100%; aspect-ratio: 1; cursor: pointer; overflow: hidden; background: #f0f0f0; }
.slot-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
.slot-overlay { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.45); opacity: 0; transition: opacity .2s; }
.slot-overlay span { color: #fff; font-size: 12px; font-weight: 600; background: rgba(0,0,0,.55); padding: 6px 14px; border-radius: 999px; }
.slot-img-wrap:hover .slot-overlay { opacity: 1; }
.slot-delete { width: 100%; padding: 8px; border: 0; border-top: 1px solid var(--admin-border); font-size: 12px; font-weight: 600; color: var(--admin-red); background: transparent; cursor: pointer; }
.slot-delete:hover { background: rgba(255,59,48,.06); }
@media (max-width:768px) {
  .slot-grid { gap: 10px; }
  .slot-card { width: calc(50% - 5px); }
}
</style>
