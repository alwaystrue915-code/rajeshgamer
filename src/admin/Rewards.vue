<script setup>
import { ref, onMounted } from 'vue'
const rewards = ref([])
const loading = ref(true)
onMounted(async () => {
  try {
    const res = await fetch('/api/rewards', { cache: 'no-store' })
    const data = await res.json()
    if (data.status === 'success') rewards.value = (data.rewards || []).filter(r => r?.id)
  } catch {} finally { loading.value = false }
})
</script>
<template>
  <h1>Rewards</h1>
  <p class="subtitle">All available rewards from the API</p>
  <div v-if="loading" style="color:var(--admin-text-secondary);padding:40px 0">Loading...</div>
  <div v-else class="admin-card" style="padding:0">
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Slot</th><th>Reward ID</th><th>Image</th></tr></thead>
        <tbody>
          <tr v-for="r in rewards" :key="r.id">
            <td><span class="badge badge-blue">Slot {{ r.slot_id }}</span></td>
            <td><strong>{{ r.id }}</strong></td>
            <td><img :src="r.image_url" :alt="'Reward ' + r.id" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid var(--admin-border)"></td>
          </tr>
          <tr v-if="!rewards.length"><td colspan="3" style="text-align:center;color:var(--admin-text-secondary);padding:40px">No rewards found</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
