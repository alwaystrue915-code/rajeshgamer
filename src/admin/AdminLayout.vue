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
          <button class="mobile-close" @click="closeMobile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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
        <button class="mobile-hamburger" @click="showMobile = true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
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
.mobile-backdrop { position: absolute; inset: 0; background: rgba(15,23,42,.55); backdrop-filter: blur(4px); }
.mobile-sidebar { position: absolute; top: 0; left: 0; width: 260px; height: 100vh; display: flex; flex-direction: column; background: #fcfcfd; animation: admin-slide .25s ease; }
.mobile-sidebar-header { padding: 16px 18px 18px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #eceef3; }
.mobile-sidebar-header .logo { width: 38px; height: 38px; border-radius: 12px; background: #44C965; display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 7px 18px rgba(68,201,101,.27); }
.mobile-sidebar-header .logo svg { width: 20px; height: 20px; color: #fff; }
.mobile-sidebar-header span { flex: 1; color: #202333; font-size: 16px; font-weight: 900; }
.mobile-close { flex-shrink: 0; width: 22px; height: 22px; padding: 0; border: 0; background: none; color: #555b6c; cursor: pointer; }
.mobile-close svg { width: 100%; height: 100%; display: block; }
.mobile-overlay { position: fixed; z-index: 999; inset: 0; animation: admin-fade .2s ease; }
.mobile-hamburger { flex-shrink: 0; width: 36px; height: 36px; padding: 0; margin-left: -4px; border: 0; border-radius: 10px; background: transparent; color: var(--admin-text); cursor: pointer; display: grid; place-items: center; }
.mobile-hamburger:hover { background: rgba(0,0,0,.04); }
.mobile-hamburger svg { width: 22px; height: 22px; display: block; }
@keyframes admin-fade { from { opacity: 0; } }
@keyframes admin-slide { from { transform: translateX(-100%); } }
@media (max-width:768px) {
  .admin-sidebar { display: none; }
  .admin-main-wrap { margin-left: 0; }
  .admin-mobile-header { display: flex; position: sticky; top: 0; z-index: 20; height: 56px; align-items: center; gap: 6px; padding: 0 12px; background: #F2F2F7; backdrop-filter: blur(18px); border-bottom: 1px solid rgba(0,0,0,.05); }
  .admin-mobile-header .logo { width: 30px; height: 30px; border-radius: 9px; background: #44C965; display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 5px 12px rgba(68,201,101,.22); }
  .admin-mobile-header .logo svg { width: 16px; height: 16px; color: #fff; }
  .admin-mobile-header span { font-size: 14px; font-weight: 800; color: var(--admin-text); letter-spacing: -.2px; }
  .mobile-sidebar { width: min(290px,86vw); padding: 12px; box-sizing: border-box; }
  .mobile-sidebar-header { padding: 8px 6px 18px !important; }
  .admin-main { padding: 26px 18px 40px !important; }
}
</style>
