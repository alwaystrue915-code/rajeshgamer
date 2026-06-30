<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
async function login() {
  error.value = ''
  if (!username.value || !password.value) { error.value = 'Fill all fields.'; return }
  loading.value = true
  try {
    const res = await fetch('https://app.nexapk.in/rajesh/admin_login.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.value, password: password.value }) })
    const data = await res.json()
    if (data.status === 'success') { sessionStorage.setItem('admin_token', data.token || '1'); router.push('/admin') }
    else error.value = data.message || 'Invalid credentials.'
  } catch { error.value = 'Server error.' }
  finally { loading.value = false }
}
</script>
<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <div class="logo" v-html='`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`'></div>
      <h1>Admin Login</h1>
      <p>Premium Rewards Panel</p>
      <div class="field"><label>Username</label><input v-model="username" type="text" placeholder="admin" @keyup.enter="login"></div>
      <div class="field"><label>Password</label><input v-model="password" type="password" placeholder="••••••••" @keyup.enter="login"></div>
      <p v-if="error" class="admin-login-error">{{ error }}</p>
      <button @click="login" :disabled="loading">{{ loading ? 'Signing in...' : 'Sign In' }}</button>
    </div>
  </div>
</template>
