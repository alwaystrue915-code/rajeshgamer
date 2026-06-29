<script setup>
import { computed, onMounted, ref } from 'vue'
import ElectricBorder from './components/ElectricBorder.vue'

const API_URL = 'https://app.nexapk.in/rajesh/api.php'
const CACHE_KEY = 'premium_rewards_cache'
const CACHE_TTL = 120000
const rewards = ref([])
const settings = ref({ claim_mode: 'popup', redirect_url: '', popup_message: 'Your rewards will be sent to your mailbox.' })
const loading = ref(true)
const loadError = ref(false)

const uid = ref('')
const uidInput = ref(null)
const selectedRewards = ref([])
const status = ref('')
const statusType = ref('')
const showSuccess = ref(false)
const isDarkRoute = computed(() => window.location.pathname === '/app' || window.location.pathname.startsWith('/app/'))

function preconnectDomains() {
  ;['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://app.nexapk.in'].forEach((url) => {
    if (!document.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = url
      if (url.includes('fonts.gstatic.com') || url.includes('nexapk.in')) link.crossOrigin = ''
      document.head.appendChild(link)
    }
  })
}

function getCachedData() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (Date.now() - cached.ts > CACHE_TTL) { sessionStorage.removeItem(CACHE_KEY); return null }
    return cached.data
  } catch { return null }
}

function setCachedData(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })) } catch {}
}

async function fetchRewards() {
  const cached = getCachedData()
  if (cached) {
    settings.value = { ...settings.value, ...(cached.settings || {}) }
    rewards.value = (cached.rewards || []).filter((r) => r?.id && r?.image_url).slice(0, 6)
    selectedRewards.value = selectedRewards.value.filter((id) => rewards.value.some((r) => r.id === id))
    loading.value = false
    return
  }
  loading.value = true
  loadError.value = false
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(API_URL, { signal: controller.signal, cache: 'force-cache', headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (data.status !== 'success') throw new Error('API returned an error')
    settings.value = { ...settings.value, ...(data.settings || {}) }
    rewards.value = (data.rewards || [])
      .filter((reward) => reward?.id && reward?.image_url)
      .slice(0, 6)
    selectedRewards.value = selectedRewards.value.filter((id) => rewards.value.some((reward) => reward.id === id))
    setCachedData(data)
    rewards.value.forEach((r) => {
      try {
        const url = new URL(r.image_url)
        if (!document.querySelector(`link[rel="preconnect"][href="${url.origin}"]`)) {
          const link = document.createElement('link')
          link.rel = 'preconnect'
          link.href = url.origin
          document.head.appendChild(link)
        }
      } catch {}
    })
  } catch {
    loadError.value = true
  } finally {
    clearTimeout(timeout)
    loading.value = false
  }
}

function isSelected(name) {
  return selectedRewards.value.includes(name)
}

function toggleReward(name) {
  selectedRewards.value = isSelected(name)
    ? selectedRewards.value.filter((reward) => reward !== name)
    : [...selectedRewards.value, name]

  const count = selectedRewards.value.length
  status.value = isDarkRoute.value
    ? ''
    : count
      ? `${count} reward${count > 1 ? 's' : ''} selected. Enter your UID to continue.`
      : 'Select one or more rewards.'
  statusType.value = ''
}

function validateUid() {
  const value = uid.value.trim()
  if (!/^\d{6,12}$/.test(value)) {
    status.value = 'Enter a valid 6–12 digit Player UID.'
    statusType.value = 'error'
    uidInput.value?.focus()
    return false
  }
  status.value = `Player ${value} verified — choose your reward!`
  statusType.value = 'success'
  return true
}

function claimRewards() {
  if (settings.value.claim_mode === 'redirect') {
    const url = settings.value.redirect_url?.trim()
    if (url) window.location.assign(url)
    else {
      status.value = 'Redirect URL is not configured.'
      statusType.value = 'error'
    }
    return
  }
  const count = selectedRewards.value.length
  if (!count) {
    status.value = 'Choose at least one reward first.'
    statusType.value = 'error'
    document.querySelector('.rewards')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  if (!validateUid()) return
  status.value = ''
  statusType.value = ''
  showSuccess.value = true
}

onMounted(() => { preconnectDomains(); fetchRewards() })
</script>

<template>
  <main class="page-shell" :class="isDarkRoute ? 'page-dark' : 'page-blue'">
    <section class="event-card" :class="isDarkRoute ? 'theme-dark' : 'theme-blue'">
      <header v-if="!isDarkRoute" class="hero">
        <img src="/assets/blue-header.png" alt="Limited time event — Free Fire Premium Rewards" fetchpriority="high" decoding="async">
      </header>
      <form class="uid-form" @submit.prevent="validateUid">
        <label for="uid" class="sr-only">Player UID</label>
        <span class="user-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="5"/><path d="M3 22c0-5.2 3.4-8 9-8s9 2.8 9 8z"/></svg>
        </span>
        <input id="uid" ref="uidInput" v-model="uid" inputmode="numeric" autocomplete="off" placeholder="Enter your Player UID">
      </form>
      <p class="status" :class="statusType" aria-live="polite">{{ status }}</p>

      <section v-if="loading" class="rewards rewards-loading" aria-label="Loading rewards">
        <div v-for="n in 6" :key="n" class="reward-skeleton"></div>
      </section>
      <section v-else-if="loadError" class="reward-error">
        <p>Rewards load nahi ho sake.</p>
        <button type="button" @click="fetchRewards">RETRY</button>
      </section>
      <section v-else class="rewards" aria-label="Available rewards">
        <ElectricBorder
          v-for="(reward, index) in rewards"
          :key="reward.id"
          class="reward-electric"
          :active="isSelected(reward.id)"
          :color="isDarkRoute ? '#ffbf00' : '#168cff'"
          :speed="1.15"
          :chaos="0.55"
          :thickness="2"
          :border-radius="20"
        >
          <article class="reward-card" :class="{ selected: isSelected(reward.id) }" :style="{ '--delay': `${index * 60}ms` }">
            <div class="reward-art reward-image">
              <img :src="reward.image_url" :alt="`Reward ${reward.slot_id}`" loading="lazy" decoding="async" :fetchpriority="index < 3 ? 'high' : 'auto'">
            </div>
            <button class="claim-small" type="button" @click="toggleReward(reward.id)">
              {{ isSelected(reward.id) ? 'SELECTED' : 'CLAIM' }}
            </button>
          </article>
        </ElectricBorder>
      </section>

      <button class="claim-main" type="button" @click="claimRewards">
        <span class="gift" aria-hidden="true">
          <svg viewBox="0 0 32 32"><path d="M4 13h24v15H4zM2 8h28v7H2zM16 8v20M16 8c-1-5-8-7-8-2 0 3 5 3 8 2Zm0 0c1-5 8-7 8-2 0 3-5 3-8 2Z"/></svg>
        </span>
        <span><strong>CLAIM NOW</strong><small>Don't miss your chance!</small></span>
      </button>
      <p class="fine-print">Rewards are available during the event period. One reward per verified player.</p>
    </section>

    <Transition name="success-pop">
      <div v-if="showSuccess" class="success-overlay" role="dialog" aria-modal="true" aria-labelledby="success-title" @click.self="showSuccess = false">
        <div class="success-particles" aria-hidden="true">
          <i v-for="n in 18" :key="n" :style="{ '--i': n }"></i>
        </div>
        <section class="success-modal">
          <div class="success-rings" aria-hidden="true"><span></span><span></span></div>
          <div class="success-check" aria-hidden="true">
            <svg viewBox="0 0 52 52"><path d="M14 27l8 8 17-18"/></svg>
          </div>
          <p class="success-kicker">REWARD CONFIRMED</p>
          <h2 id="success-title">Claim Successful!</h2>
          <p class="popup-message">{{ settings.popup_message || 'Your rewards will be sent to your mailbox.' }}</p>
          <p><strong>{{ selectedRewards.length }}</strong> rewards reserved for Player <strong>{{ uid.trim() }}</strong></p>
          <button type="button" @click="showSuccess = false">CONTINUE</button>
        </section>
      </div>
    </Transition>
  </main>
</template>
