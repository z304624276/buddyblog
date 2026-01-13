<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>创建账户</h1>
        <p class="muted">直接注册，无需邮箱验证</p>
      </div>

      <form @submit.prevent="handleSignup" class="auth-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="yourname"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="至少 6 个字符"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="再次输入密码"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          <div class="spinner"></div>
          <span>注册成功，正在登录中...</span>
        </div>

        <button type="submit" class="btn btn-primary btn-lg btn-full" :disabled="loading || success">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <div class="auth-footer">
        <p class="muted">已有账户？</p>
        <router-link to="/login" class="btn btn-link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isStrongPassword } from '@/lib/utils'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const handleSignup = async () => {
  // 验证密码
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (!isStrongPassword(password.value)) {
    error.value = '密码至少需要 6 个字符'
    return
  }

  try {
    loading.value = true
    error.value = ''

    await authStore.signUp(email.value, password.value, username.value)

    // 注册成功，显示登录中提示
    loading.value = false
    success.value = true

    // 延迟跳转到控制台
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (err) {
    error.value = err.message || '注册失败，请稍后重试'
    success.value = false
    // 注册失败不跳转，只显示错误
  } finally {
    if (!success.value) {
      loading.value = false
    }
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

.success-message {
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  color: #059669;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(5, 150, 105, 0.2);
  border-top-color: #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
