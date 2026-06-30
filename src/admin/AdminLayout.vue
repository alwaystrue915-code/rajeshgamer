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
  { path: '/admin', label: 'Dashboard', color: '#6366f1', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>' },
  { path: '/admin/settings', label: 'Settings', color: '#8b5cf6', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V9.6h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.2.4.6.8 1 1 .3.2.7.3 1.1.3h.1v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></svg>' },
  { path: '/admin/rewards', label: 'Rewards', color: '#f59e0b', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18v11H3zM2 6h20v4H2zM12 6v15M12 6c-1-4-6-5-6-2 0 2 4 3 6 2Zm0 0c1-4 6-5 6-2 0 2-4 3-6 2Z"/></svg>' },
  { path: '/admin/upload', label: 'Upload', color: '#06b6d4', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>' },
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
          <span class="nav-icon" :style="{ color: item.color, backgroundColor: item.color + '18' }" v-html="item.svg"></span>
          {{ item.label }}
        </router-link>
      </nav>
      <div class="admin-sidebar-footer">
        <a @click="logout"><span class="logout-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></svg></span><span>Logout</span></a>
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
            <span class="nav-icon" :style="{ color: item.color, backgroundColor: item.color + '18' }" v-html="item.svg"></span>
            {{ item.label }}
          </router-link>
        </nav>
        <div class="admin-sidebar-footer">
          <a @click="logout(); closeMobile()"><span class="logout-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></svg></span><span>Logout</span></a>
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
.mobile-sidebar-header .logo { width: 34px; height: 34px; border-radius: 11px; background: linear-gradient(145deg,#7c3aed,#4f46e5); display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 7px 18px rgba(79,70,229,.35); }
.mobile-sidebar-header .logo svg { width: 16px; height: 16px; color: #fff; }
.mobile-sidebar-header span { flex: 1; color: var(--admin-text); font-size: 15px; font-weight: 700; }
@media (max-width:768px) {
  .admin-sidebar { display: none; }
  .admin-main-wrap { margin-left: 0; }
  .admin-mobile-header { display: flex; position: sticky; top: 0; z-index: 20; height: 52px; align-items: center; gap: 10px; padding: 0 16px; background: var(--admin-sidebar); border-bottom: 1px solid var(--admin-border); }
  .admin-mobile-header .logo { width: 30px; height: 30px; border-radius: 9px; background: linear-gradient(145deg,#7c3aed,#4f46e5); display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 6px 15px rgba(79,70,229,.3); }
  .admin-mobile-header .logo svg { width: 14px; height: 14px; color: #fff; }
  .admin-mobile-header span { font-size: 14px; font-weight: 700; color: var(--admin-text); }
  .mobile-hamburger { display: block; }
  .mobile-overlay { position: fixed; z-index: 999; inset: 0; }
  .admin-main { padding: 20px 16px; }
}
</style>
