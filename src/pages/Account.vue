<template>
  <div class="account-page">
    <div class="page-header">
      <h1>账户设置</h1>
    </div>

    <div class="account-section">
      <h2>修改密码</h2>
      <form @submit.prevent="handlePasswordChange" class="account-form">
        <div class="form-group">
          <label for="currentPassword">当前密码</label>
          <input
            id="currentPassword"
            v-model="currentPassword"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div class="form-group">
          <label for="newPassword">新密码</label>
          <input
            id="newPassword"
            v-model="newPassword"
            type="password"
            placeholder="至少 6 个字符"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">确认新密码</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="再次输入新密码"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          密码修改成功
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '修改中...' : '修改密码' }}
        </button>
      </form>
    </div>

    <div class="account-section">
      <h2>账户信息</h2>
      <div class="info-grid">
        <div class="info-item">
          <label>用户名</label>
          <div class="info-value">{{ username }}</div>
        </div>

        <div class="info-item">
          <label>邮箱</label>
          <div class="info-value">{{ email }}</div>
        </div>

        <div class="info-item">
          <label>注册时间</label>
          <div class="info-value">{{ formatDate(createdAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/supabase/client'
import { formatDate, isStrongPassword } from '@/lib/utils'

const router = useRouter()
const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const profile = ref(null)

const username = computed(() => profile.value?.username || authStore.user?.user_metadata?.username || '')
const email = computed(() => authStore.user?.email || '')
const createdAt = computed(() => authStore.user?.created_at || '')

// 加载用户资料
const loadProfile = async () => {
  if (!authStore.user) return

  try {
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authStore.user.id)

    if (err) {
      console.error('加载用户资料失败:', err)
      return
    }

    if (data && data.length > 0) {
      profile.value = data[0]
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
  }
}

onMounted(() => {
  loadProfile()
})

const handlePasswordChange = async () => {
  // 验证密码
  if (newPassword.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    success.value = false
    return
  }

  if (!isStrongPassword(newPassword.value)) {
    error.value = '密码至少需要 6 个字符'
    success.value = false
    return
  }

  try {
    loading.value = true
    error.value = ''
    success.value = false

    await authStore.updatePassword(currentPassword.value, newPassword.value)

    success.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    // 修改密码成功后退出登录
    setTimeout(async () => {
      try {
        await authStore.signOut()
        // 退出登录成功后跳转到登录页
        router.push('/login')
      } catch (signOutError) {
        console.error('退出登录失败:', signOutError)
        // 即使退出失败也强制刷新页面跳转
        window.location.href = '/login'
      }
    }, 1500)
  } catch (err) {
    error.value = err.message || '修改密码失败'
    success.value = false
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.account-page {
  max-width: 700px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text);
  margin: 0;
  background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.account-section {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid var(--border);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08);
  position: relative;
  overflow: hidden;
}

.account-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.account-section h2 {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 1.5rem 0;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.account-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--border);
  border-radius: 16px;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
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
  font-weight: 600;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.info-item label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text);
}

.info-item .info-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  padding: 0.85rem 1rem;
  background: rgba(240, 247, 255, 0.5);
  border-radius: 16px;
  border: 2px solid var(--border);
}
</style>
