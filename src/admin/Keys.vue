<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSocket } from '../composables/useSocket.js'
const socket = useSocket()
const keys = ref([])
const loading = ref(true)
const generating = ref(false)
const toast = ref('')
let toastTimer = null
function showToast(msg) { toast.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.value = '', 3000) }
async function loadKeys() {
  try {
    const res = await fetch('/api/admin/keys', { cache: 'no-store' })
    const data = await res.json()
    if (data.status === 'success') keys.value = data.keys || []
  } catch { showToast('Failed to load keys.') }
  finally { loading.value = false }
}
async function generateKey() {
  generating.value = true
  try {
    const res = await fetch('/api/admin/keys', { method: 'POST' })
    const data = await res.json()
    if (data.status === 'success') { keys.value = data.keys || []; showToast('Key generated!') }
    else showToast(data.message || 'Failed.')
  } catch { showToast('Network error.') }
  finally { generating.value = false }
}
async function toggleKey(id) {
  try {
    const res = await fetch(`/api/admin/keys/${encodeURIComponent(id)}/toggle`, { method: 'PUT' })
    const data = await res.json()
    if (data.status === 'success') keys.value = data.keys || []
    else showToast(data.message || 'Failed.')
  } catch { showToast('Network error.') }
}
async function deleteKey(id) {
  if (!confirm('Delete this key?')) return
  try {
    const res = await fetch(`/api/admin/keys/${encodeURIComponent(id)}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.status === 'success') keys.value = data.keys || []
    else showToast(data.message || 'Failed.')
  } catch { showToast('Network error.') }
}
onMounted(() => { loadKeys(); socket.on('keys:updated', loadKeys) })
onUnmounted(() => { socket.off('keys:updated', loadKeys) })
</script>
<template>
  <div class="admin-page-toolbar">
    <div><h1>Access Keys</h1><p class="subtitle">Generate and manage keys — each key works on one device only</p></div>
    <button class="admin-btn admin-btn-success" @click="generateKey" :disabled="generating">{{ generating ? 'Generating...' : 'Generate Key' }}</button>
  </div>
  <div v-if="loading" class="key-state">Loading keys...</div>
  <div v-else-if="!keys.length" class="key-state"><p>No keys yet.</p><button class="admin-btn admin-btn-primary" @click="generateKey">Generate First Key</button></div>
  <div v-else class="key-list">
    <div v-for="k in keys" :key="k.id" class="key-row" :class="{ inactive: !k.is_active }">
      <div class="key-info">
        <code class="key-value">{{ k.key }}</code>
        <span class="key-status" :class="k.is_active ? 'active' : 'deactive'">{{ k.is_active ? 'Active' : 'Deactivated' }}</span>
      </div>
      <div class="key-meta">
        <span v-if="k.device_id" class="key-device" title="Registered device ID">Device: <code>{{ k.device_id.slice(0, 12) }}...</code></span>
        <span v-else class="key-device empty">Not used</span>
        <span class="key-date">{{ new Date(k.created_at).toLocaleDateString() }}</span>
      </div>
      <div class="key-actions">
        <button class="admin-btn" :class="k.is_active ? 'admin-btn-warning' : 'admin-btn-primary'" @click="toggleKey(k.id)">{{ k.is_active ? 'Deactivate' : 'Activate' }}</button>
        <button class="admin-btn admin-btn-danger" @click="deleteKey(k.id)">Delete</button>
      </div>
    </div>
  </div>
  <div v-if="toast" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:10px;background:#1c1c1e;color:#fff;font-size:14px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.3)">{{ toast }}</div>
</template>
<style scoped>
.key-state { min-height: 200px; display: grid; place-items: center; gap: 14px; color: var(--admin-text-secondary); text-align: center; padding: 34px; border: 1px dashed #d8dee9; border-radius: 18px; background: #fff; }
.key-state p { margin: 0; font-weight: 800; }
.key-list { display: flex; flex-direction: column; gap: 10px; }
.key-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 16px; background: var(--admin-card); border: 1px solid var(--admin-border); box-shadow: var(--admin-shadow); }
.key-row.inactive { opacity: .6; }
.key-info { display: flex; align-items: center; gap: 10px; flex: 1 1 200px; }
.key-value { font-size: 14px; font-weight: 700; letter-spacing: .5px; padding: 4px 10px; border-radius: 8px; background: #f2f5f9; color: #1a1a2e; }
.key-status { font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; }
.key-status.active { background: rgba(52,199,89,.12); color: #34c759; }
.key-status.deactive { background: rgba(255,59,48,.1); color: #ff3b30; }
.key-meta { display: flex; align-items: center; gap: 12px; flex: 1 1 180px; font-size: 12px; color: var(--admin-text-secondary); }
.key-device code { font-size: 11px; background: #f2f5f9; padding: 2px 6px; border-radius: 4px; color: #555; }
.key-device.empty { color: #a6acba; font-style: italic; }
.key-date { white-space: nowrap; }
.key-actions { display: flex; gap: 8px; flex-shrink: 0; }
</style>
