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
    <!-- Desktop Sidebar -->
    <aside class="admin-sidebar">
      <div class="admin-sidebar-header">
        <div class="logo" v-html='`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`'></div>
        <span>Admin Panel</span>
      </div>
      <nav class="admin-nav">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" :class="{ active: isActive(item.path) }">
          <span class="nav-icon" :style="{ color: item.color }" v-html="item.svg"></span>
          {{ item.label }}
        </router-link>
      </nav>
      <div class="admin-sidebar-footer">
        <a @click="logout" v-html='`<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Logout`'></a>
      </div>
    </aside>

    <!-- Mobile Overlay -->
    <div v-if="showMobile" class="mobile-overlay">
      <div class="mobile-backdrop" @click="closeMobile"></div>
      <aside class="mobile-sidebar">
        <div class="mobile-sidebar-header">
          <div class="logo" v-html='`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`'></div>
          <span>Admin Panel</span>
          <button class="mobile-close" @click="closeMobile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav class="admin-nav">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path" :class="{ active: isActive(item.path) }" @click="closeMobile">
            <span class="nav-icon" :style="{ color: item.color }" v-html="item.svg"></span>
            {{ item.label }}
          </router-link>
        </nav>
        <div class="admin-sidebar-footer">
          <a @click="logout; closeMobile()" v-html='`<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Logout`'></a>
        </div>
      </aside>
    </div>

    <!-- Main Content -->
    <div class="admin-main-wrap">
      <header class="admin-mobile-header">
        <button class="mobile-hamburger" @click="showMobile = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="logo" v-html='`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`'></div>
        <span>Admin Panel</span>
      </header>
      <main class="admin-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.mobile-hamburger { display: none; background: none; border: 0; padding: 0; width: 24px; height: 24px; color: var(--admin-text); cursor: pointer; flex-shrink: 0; }
.mobile-close { background: none; border: 0; padding: 0; width: 22px; height: 22px; color: var(--admin-text-secondary); cursor: pointer; flex-shrink: 0; }
.mobile-close svg, .mobile-hamburger svg { width: 100%; height: 100%; display: block; }
.mobile-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.2); backdrop-filter: blur(4px); }
.mobile-sidebar { position: absolute; top: 0; left: 0; width: 260px; height: 100vh; display: flex; flex-direction: column; background: var(--admin-sidebar); }
.mobile-sidebar-header { padding: 16px 16px 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--admin-border); }
.mobile-sidebar-header .logo { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg,#34c759,#28a745); display: grid; place-items: center; flex-shrink: 0; }
.mobile-sidebar-header .logo svg { width: 16px; height: 16px; color: #fff; }
.mobile-sidebar-header span { flex: 1; color: var(--admin-text); font-size: 15px; font-weight: 700; }
@media (max-width:768px) {
  .admin-sidebar { display: none; }
  .admin-main-wrap { margin-left: 0; }
  .admin-mobile-header { display: flex; position: sticky; top: 0; z-index: 20; height: 52px; align-items: center; gap: 10px; padding: 0 16px; background: var(--admin-sidebar); border-bottom: 1px solid var(--admin-border); }
  .admin-mobile-header .logo { width: 26px; height: 26px; border-radius: 6px; background: linear-gradient(135deg,#34c759,#28a745); display: grid; place-items: center; flex-shrink: 0; }
  .admin-mobile-header .logo svg { width: 14px; height: 14px; color: #fff; }
  .admin-mobile-header span { font-size: 14px; font-weight: 700; color: var(--admin-text); }
  .mobile-hamburger { display: block; }
  .mobile-overlay { position: fixed; z-index: 999; inset: 0; }
  .admin-main { padding: 20px 16px; }
}
</style>
