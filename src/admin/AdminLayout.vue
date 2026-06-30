<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const showMobile = ref(false)
function isActive(path) { return route.path === path }
function logout() { sessionStorage.removeItem('admin_token'); router.push('/admin/login') }
function closeMobile() { showMobile.value = false }
const navItems = [
  { path: '/admin', label: 'Dashboard', color: '#34c759', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>' },
  { path: '/admin/settings', label: 'Settings', color: '#8e8e93', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' },
  { path: '/admin/rewards', label: 'Rewards', color: '#ff9500', svg: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13h24v15H4zM2 8h28v7H2zM16 8v20M16 8c-1-5-8-7-8-2 0 3 5 3 8 2Zm0 0c1-5 8-7 8-2 0 3-5 3-8 2Z"/></svg>' },
]
</script>
<template>
  <div class="admin-shell">
    <button class="mobile-hamburger" @click="showMobile = !showMobile" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
    <div v-if="showMobile" class="mobile-overlay" @click="closeMobile"></div>
    <aside class="admin-sidebar" :class="{ 'mobile-open': showMobile }">
      <div class="admin-sidebar-header">
        <div class="logo" v-html='`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`'></div>
        <span>Admin Panel</span>
      </div>
      <nav class="admin-nav">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" :class="{ active: isActive(item.path) }" @click="closeMobile">
          <span class="nav-icon" :style="{ color: item.color }" v-html="item.svg"></span>
          {{ item.label }}
        </router-link>
      </nav>
      <div class="admin-sidebar-footer">
        <a @click="logout" v-html='`<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Logout`'></a>
      </div>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.mobile-hamburger { display: none; position: fixed; z-index: 200; top: 12px; left: 12px; width: 36px; height: 36px; border: 0; border-radius: 10px; background: var(--admin-sidebar); cursor: pointer; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 0; }
.mobile-hamburger span { display: block; width: 18px; height: 2px; border-radius: 2px; background: var(--admin-text); }
.mobile-overlay { display: none; position: fixed; z-index: 99; inset: 0; background: rgba(0,0,0,.35); }
@media (max-width:768px) {
  .mobile-hamburger { display: flex; }
  .admin-sidebar { display: none; }
  .admin-sidebar.mobile-open { display: flex; }
  .mobile-overlay { display: block; }
}
</style>
