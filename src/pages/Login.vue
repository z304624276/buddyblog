<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>欢迎回来</h1>
        <p class="muted">登录到你的账户</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">用户名或邮箱</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名或邮箱"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary btn-lg btn-full" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="auth-footer">
        <p class="muted">还没有账户？</p>
        <router-link to="/signup" class="btn btn-link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    await authStore.signIn(username.value, password.value)

    // 跳转到之前的页面或首页
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    // 更友好的错误提示
    const message = err.message || '登录失败，请检查用户名和密码'

    if (message.includes('Invalid login')) {
      error.value = '用户名或密码错误'
    } else if (message.includes('Email not confirmed')) {
      error.value = '邮箱未验证，请先验证邮箱'
    } else if (message.includes('用户名或密码错误')) {
      error.value = '用户名或密码错误'
    } else {
      error.value = message
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
}

.auth-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid var(--border);
  border-radius: 32px;
  padding: 2.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 48px rgba(59, 130, 246, 0.15);
  position: relative;
  overflow: hidden;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.auth-header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 0.6rem 0;
  background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.muted {
  color: var(--muted);
  margin: 0;
  font-weight: 500;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
}

.form-group input {
  padding: 0.9rem 1.1rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--border);
  border-radius: 16px;
  color: var(--text);
  font-size: 0.95rem;
  transition: all 0.3s;
  font-weight: 500;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.form-group input::placeholder {
  color: var(--muted);
}

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  color: #ef4444;
  font-size: 0.9rem;
  font-weight: 600;
}

.auth-footer {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  position: relative;
  z-index: 1;
}

.btn-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 700;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  transition: all 0.3s;
}

.btn-link:hover {
  background: rgba(240, 247, 255, 0.8);
  text-decoration: none;
  transform: translateY(-2px);
}
</style>
