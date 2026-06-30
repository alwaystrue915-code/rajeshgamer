<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSocket } from '../composables/useSocket.js'
const router = useRouter()
const stats = ref({ totalRewards: 0, claimMode: '—', redirectUrl: '—' })
const loading = ref(true)
const socket = useSocket()

async function loadStats() {
  try {
    const [settingsRes, rewardsRes] = await Promise.all([
      fetch('/api/admin/settings', { cache: 'no-store' }),
      fetch('/api/rewards', { cache: 'no-store' })
    ])
    const settingsData = await settingsRes.json()
    const rewardsData = await rewardsRes.json()
    if (settingsData.status === 'success') {
      const uploadedRewards = (rewardsData.rewards || []).filter((reward) => reward?.image_url)
      stats.value = {
        totalRewards: uploadedRewards.length,
        claimMode: settingsData.settings?.claim_mode || '—',
        redirectUrl: settingsData.settings?.redirect_url || '—',
      }
    }
  } catch {
    stats.value = { totalRewards: 0, claimMode: '—', redirectUrl: '—' }
  } finally { loading.value = false }
}

function refreshStats() {
  loadStats()
}

onMounted(() => {
  loadStats()
  socket.on('settings:updated', refreshStats)
  socket.on('rewards:updated', refreshStats)
})

onUnmounted(() => {
  socket.off('settings:updated', refreshStats)
  socket.off('rewards:updated', refreshStats)
})
</script>
<template>
  <section class="dash-hero">
    <div>
      <p class="dash-kicker">Admin Overview</p>
      <h1>Dashboard</h1>
      <p class="subtitle">Rewards, claim mode aur quick controls ek jagah.</p>
    </div>
    <button class="admin-btn admin-btn-success" @click="router.push('/admin/rewards')">Manage Rewards</button>
  </section>
  <div v-if="loading" class="dash-loading">Loading dashboard...</div>
  <template v-else>
    <div class="stats-grid">
      <div class="stat-card dash-stat-green">
        <div class="stat-header">
          <span class="stat-label">Total Rewards</span>
          <div class="stat-icon" style="background:rgba(52,199,89,.12);color:var(--admin-green)" v-html='`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`'></div>
        </div>
        <div class="stat-value">{{ stats.totalRewards }}</div>
        <p class="stat-note">Active slots shown on public pages</p>
      </div>
      <div class="stat-card dash-stat-blue">
        <div class="stat-header">
          <span class="stat-label">Claim Mode</span>
          <div class="stat-icon" style="background:rgba(0,122,255,.12);color:var(--admin-blue)" v-html='`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`'></div>
        </div>
        <div class="stat-value" style="text-transform:capitalize">{{ stats.claimMode }}</div>
        <p class="stat-note">Popup or redirect behavior</p>
      </div>
      <div class="stat-card dash-stat-orange">
        <div class="stat-header">
          <span class="stat-label">Redirect URL</span>
          <div class="stat-icon" style="background:rgba(255,149,0,.12);color:var(--admin-orange)" v-html='`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`'></div>
        </div>
        <div class="stat-value" style="font-size:16px">
          <span class="badge" :class="stats.redirectUrl && stats.redirectUrl !== '—' ? 'badge-green' : 'badge-red'">{{ stats.redirectUrl && stats.redirectUrl !== '—' ? 'Enabled' : 'Disabled' }}</span>
        </div>
        <p class="stat-note">Used when claim mode is redirect</p>
      </div>
    </div>
    <div class="dash-actions">
      <div class="dash-action-card" @click="router.push('/admin/settings')">
        <span class="dash-action-icon blue">S</span>
        <div>
          <h2>Edit Settings</h2>
          <p>Claim mode aur redirect URL update karo.</p>
        </div>
      </div>
      <div class="dash-action-card" @click="router.push('/admin/rewards')">
        <span class="dash-action-icon green">R</span>
        <div>
          <h2>Manage Rewards</h2>
          <p>Slot images upload/delete smoothly.</p>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.dash-hero { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 24px; padding: 24px; border: 1px solid #e8ebf2; border-radius: 24px; background: linear-gradient(135deg,#ffffff,#f4fff7); box-shadow: var(--admin-shadow); }
.dash-kicker { margin: 0 0 6px; color: #44C965; font-size: 12px; font-weight: 900; letter-spacing: .9px; text-transform: uppercase; }
.dash-hero h1 { margin: 0 0 4px !important; }
.dash-hero .subtitle { margin: 0 !important; }
.dash-loading { min-height: 220px; display: grid; place-items: center; color: var(--admin-text-secondary); border-radius: 20px; background: #fff; box-shadow: var(--admin-shadow); }
.stat-card { border: 0; }
.dash-stat-green { background: linear-gradient(145deg,#ffffff,#effff3); }
.dash-stat-blue { background: linear-gradient(145deg,#ffffff,#f1f6ff); }
.dash-stat-orange { background: linear-gradient(145deg,#ffffff,#fff7ed); }
.stat-note { position: relative; z-index: 1; margin: 10px 0 0; color: var(--admin-text-secondary); font-size: 12px; font-weight: 800; }
.dash-actions { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; }
.dash-action-card { display: flex; align-items: center; gap: 15px; min-height: 105px; padding: 20px; border: 1px solid #e8ebf2; border-radius: 22px; background: #fff; box-shadow: var(--admin-shadow); cursor: pointer; transition: transform .2s ease, box-shadow .2s ease; }
.dash-action-card:hover { transform: translateY(-3px); box-shadow: var(--admin-shadow-lg); }
.dash-action-icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 16px; color: #fff; font-size: 22px; font-weight: 900; flex-shrink: 0; }
.dash-action-icon.blue { background: linear-gradient(135deg,#60a5fa,#2563eb); }
.dash-action-icon.green { background: linear-gradient(135deg,#44C965,#16a34a); }
.dash-action-card h2 { margin: 0 0 4px; font-size: 17px; font-weight: 900; color: var(--admin-text); }
.dash-action-card p { margin: 0; color: var(--admin-text-secondary); font-size: 13px; font-weight: 700; }
@media (max-width:768px) {
  .dash-hero { align-items: stretch; flex-direction: column; padding: 20px; }
  .dash-actions { grid-template-columns: 1fr; gap: 12px; }
}
</style>
