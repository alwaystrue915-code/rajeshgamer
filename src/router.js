import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from './admin/AdminLayout.vue'
import Login from './admin/Login.vue'
import Dashboard from './admin/Dashboard.vue'
import Settings from './admin/Settings.vue'
import Rewards from './admin/Rewards.vue'
import Upload from './admin/Upload.vue'

function authGuard(to, from, next) {
  if (!sessionStorage.getItem('admin_token')) next('/admin/login')
  else next()
}

const routes = [
  { path: '/admin/login', name: 'Login', component: Login },
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: authGuard,
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'settings', name: 'Settings', component: Settings },
      { path: 'rewards', name: 'Rewards', component: Rewards },
      { path: 'upload', name: 'Upload', component: Upload },
    ],
  },
]

export default createRouter({ history: createWebHistory(), routes })
