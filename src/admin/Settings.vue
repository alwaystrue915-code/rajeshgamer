<script setup>
import { ref, onMounted } from 'vue'
import { useSocket } from '../composables/useSocket.js'
const socket = useSocket()
const settings = ref({ claim_mode: 'popup', redirect_url: '' })
const saving = ref(false)
const toast = ref('')
let toastTimer = null
function showToast(msg) { toast.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.value = '', 3000) }
onMounted(async () => {
  try {
    const res = await fetch('/api/admin/settings', { cache: 'no-store' })
    const data = await res.json()
    if (data.status === 'success' && data.settings) settings.value = { ...settings.value, ...data.settings }
  } catch {}
  socket.on('settings:updated', (s) => { if (s) settings.value = { ...settings.value, ...s } })
})
async function save() {
  saving.value = true
  try {
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings.value) })
    const data = await res.json()
    showToast(data.status === 'success' ? 'Saved!' : 'Failed to save.')
  } catch { showToast('Network error.') }
  finally { saving.value = false }
}
</script>
<template>
  <div class="admin-page-toolbar">
    <div><h1>Settings</h1><p class="subtitle">Configure claim behavior and redirect URL</p></div>
    <button class="admin-btn admin-btn-success" @click="save" :disabled="saving">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
  </div>
  <div class="admin-card">
    <div class="field-group">
      <label>Claim Mode</label>
      <select v-model="settings.claim_mode">
        <option value="popup">Popup — show success popup on claim</option>
        <option value="redirect">Redirect — go to redirect URL on claim</option>
      </select>
    </div>
    <div class="field-group">
      <label>Redirect URL</label>
      <input v-model="settings.redirect_url" placeholder="https://example.com" type="url">
    </div>
  </div>
  <div v-if="toast" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:10px;background:#1c1c1e;color:#fff;font-size:14px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.3)">{{ toast }}</div>
</template>
