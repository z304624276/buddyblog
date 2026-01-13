<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>个人资料</h2>
        <button @click="$emit('close')" class="btn-close">
          <X :size="20" />
        </button>
      </div>

      <div class="modal-body">
        <div class="avatar-section">
          <div class="current-avatar">
            <img v-if="currentAvatar" :src="currentAvatar" :alt="username" />
            <div v-else class="avatar-placeholder">
              {{ username?.charAt(0).toUpperCase() }}
            </div>
          </div>

          <div class="avatar-actions">
            <label for="avatar-input" class="btn btn-outline btn-sm">
              <Upload :size="14" />
              上传头像
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              @change="handleAvatarUpload"
              class="hidden"
            />
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>用户名</label>
            <div class="info-value">{{ username }}</div>
          </div>

          <div class="info-item">
            <label>邮箱</label>
            <div class="info-value">{{ email }}</div>
          </div>
        </div>

        <router-link to="/account" class="btn btn-primary btn-full" @click="$emit('close')">
          前往账户设置
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/supabase/client'
import { X, Upload } from 'lucide-vue-next'

const emit = defineEmits(['close', 'refresh'])

const authStore = useAuthStore()

const profile = ref(null)

const username = computed(() => profile.value?.username || authStore.user?.user_metadata?.username || '')
const email = computed(() => authStore.user?.email || '')
const currentAvatar = computed(() => profile.value?.avatar_url || authStore.user?.user_metadata?.avatar_url)

// 加载用户资料
const loadProfile = async () => {
  if (!authStore.user) return

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authStore.user.id)

    if (error) {
      console.error('加载用户资料失败:', error)
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

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const avatarUrl = await authStore.uploadAvatar(file)

    // 更新 profiles 表
    await authStore.updateProfile({ avatar_url: avatarUrl })

    // 重新加载资料
    await loadProfile()

    // 通知其他组件刷新
    emit('refresh')
  } catch (error) {
    console.error('Failed to upload avatar:', error)
    alert('上传失败，请重试')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal {
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid var(--border);
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 12px 48px rgba(59, 130, 246, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.8rem;
  border-bottom: 2px solid var(--border);
}

.modal-header h2 {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text);
  margin: 0;
  background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-close {
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 12px;
  transition: all 0.3s;
  font-weight: 700;
}

.btn-close:hover {
  background: #ef4444;
  color: #fff;
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.8rem;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.current-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%);
  border: 4px solid #fff;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  transition: all 0.3s;
}

.current-avatar:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4);
}

.current-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 2.2rem;
}

.avatar-actions {
  display: flex;
  gap: 0.6rem;
}

.hidden {
  display: none;
}

.info-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
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

.info-item .value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  padding: 0.6rem 0.9rem;
  background: rgba(240, 247, 255, 0.5);
  border-radius: 12px;
  border: 2px solid var(--border);
}
</style>
