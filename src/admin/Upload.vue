<script setup>
import { ref } from 'vue'
const UPLOAD_API = 'https://app.nexapk.in/api.php'
const API_KEY = 'yonogames-v2'
const file = ref(null)
const urlInput = ref('')
const uploading = ref(false)
const result = ref(null)
const error = ref('')
const toast = ref('')
let toastTimer = null
function showToast(msg) { toast.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.value = '', 3000) }
function onFileSelect(e) { file.value = e.target.files[0] || null; result.value = null; error.value = '' }
async function uploadFile() {
  if (!file.value) { error.value = 'Select a file.'; return }
  uploading.value = true; error.value = ''; result.value = null
  const fd = new FormData(); fd.append('key', API_KEY); fd.append('image', file.value)
  try {
    const res = await fetch(UPLOAD_API, { method: 'POST', body: fd })
    const data = await res.json()
    if (data.success) { result.value = data; showToast('Uploaded!'); file.value = null }
    else error.value = data.error || 'Upload failed.'
  } catch { error.value = 'Network error.' }
  finally { uploading.value = false }
}
async function uploadUrl() {
  if (!urlInput.value.trim()) { error.value = 'Enter a URL.'; return }
  uploading.value = true; error.value = ''; result.value = null
  const fd = new FormData(); fd.append('key', API_KEY); fd.append('url', urlInput.value)
  try {
    const res = await fetch(UPLOAD_API, { method: 'POST', body: fd })
    const data = await res.json()
    if (data.success) { result.value = data; showToast('Uploaded!'); urlInput.value = '' }
    else error.value = data.error || 'Upload failed.'
  } catch { error.value = 'Network error.' }
  finally { uploading.value = false }
}
function copyUrl() { if (result.value?.url) { navigator.clipboard.writeText(result.value.url); showToast('URL copied!') } }
</script>
<template>
  <h1>Upload</h1>
  <p class="subtitle">Upload images or import from URL</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
    <div class="admin-card">
      <h2>File Upload</h2>
      <div class="field-group">
        <label>Select Image</label>
        <input type="file" accept="image/*" @change="onFileSelect" style="padding:8px;border:1px solid var(--admin-border);border-radius:10px;width:100%;box-sizing:border-box">
      </div>
      <button class="admin-btn admin-btn-primary" @click="uploadFile" :disabled="uploading || !file">{{ uploading ? 'Uploading...' : 'Upload' }}</button>
    </div>
    <div class="admin-card">
      <h2>URL Import</h2>
      <div class="field-group">
        <label>Image URL</label>
        <input v-model="urlInput" type="url" placeholder="https://example.com/image.png">
      </div>
      <button class="admin-btn admin-btn-primary" @click="uploadUrl" :disabled="uploading || !urlInput.trim()">{{ uploading ? 'Uploading...' : 'Import' }}</button>
    </div>
  </div>
  <div v-if="error" style="color:var(--admin-red);font-size:13px;margin-top:12px">{{ error }}</div>
  <div v-if="result" class="admin-card" style="margin-top:20px">
    <h2>Uploaded</h2>
    <img :src="result.url" style="max-width:200px;max-height:150px;border-radius:8px;border:1px solid var(--admin-border);margin-bottom:12px;display:block">
    <div style="font-size:13px;color:var(--admin-text-secondary);word-break:break-all;margin-bottom:8px">{{ result.url }}</div>
    <button class="admin-btn admin-btn-sm admin-btn-success" @click="copyUrl">Copy URL</button>
  </div>
  <div v-if="toast" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:10px;background:#1c1c1e;color:#fff;font-size:14px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.3)">{{ toast }}</div>
</template>
