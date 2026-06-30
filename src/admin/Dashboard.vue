<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const stats = ref({ totalRewards: 0, claimMode: '—', redirectUrl: '—', popupMessage: '—' })
const loading = ref(true)
onMounted(async () => {
  try {
    const res = await fetch('https://app.nexapk.in/rajesh/api.php', { cache: 'no-store' })
    const data = await res.json()
    if (data.status === 'success') {
      stats.value = {
        totalRewards: (data.rewards || []).length,
        claimMode: data.settings?.claim_mode || '—',
        redirectUrl: data.settings?.redirect_url || '—',
        popupMessage: data.settings?.popup_message || '—',
      }
    }
  } catch {} finally { loading.value = false }
})
</script>
<template>
  <h1>Dashboard</h1>
  <p class="subtitle">Premium Rewards overview</p>
  <div v-if="loading" style="color:var(--admin-text-secondary);padding:40px 0">Loading...</div>
  <template v-else>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Total Rewards</span>
          <div class="stat-icon" style="background:rgba(52,199,89,.12);color:var(--admin-green)" v-html='`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`'></div>
        </div>
        <div class="stat-value">{{ stats.totalRewards }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Claim Mode</span>
          <div class="stat-icon" style="background:rgba(0,122,255,.12);color:var(--admin-blue)" v-html='`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`'></div>
        </div>
        <div class="stat-value" style="text-transform:capitalize">{{ stats.claimMode }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Redirect URL</span>
          <div class="stat-icon" style="background:rgba(255,149,0,.12);color:var(--admin-orange)" v-html='`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`'></div>
        </div>
        <div class="stat-value" style="font-size:16px;word-break:break-all">{{ stats.redirectUrl }}</div>
      </div>
    </div>
    <div class="admin-card">
      <h2>Quick Actions</h2>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="admin-btn admin-btn-primary" @click="router.push('/admin/settings')">Edit Settings</button>
        <button class="admin-btn admin-btn-success" @click="router.push('/admin/rewards')">Manage Rewards</button>
      </div>
    </div>
  </template>
</template>
