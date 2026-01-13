<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <router-link to="/" class="brand">
          <span>Ai智能</span> 搭建的博客
        </router-link>
      </div>

      <nav class="header-nav">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/posts" class="nav-link">文章</router-link>
        <template v-if="user">
          <router-link to="/dashboard" class="nav-link">控制台</router-link>
          <router-link to="/my-posts" class="nav-link">我的文章</router-link>
        </template>
      </nav>

      <div class="header-right">
        <template v-if="user">
          <router-link to="/dashboard" class="btn btn-primary btn-sm">
            <PenLine :size="16" />
            写文章
          </router-link>

          <div class="user-menu">
            <div class="user-info" @click="toggleMenu">
              <div class="avatar">
                <img v-if="avatarUrl" :src="avatarUrl" :alt="username" />
                <div v-else class="avatar-placeholder">{{ username?.charAt(0).toUpperCase() }}</div>
              </div>
              <span class="username">{{ username }}</span>
            </div>

            <div v-if="menuOpen" class="menu-dropdown">
              <div class="menu-item" @click="handleMenuItemClick(() => showProfile = true)">
                <User :size="16" />
                个人资料
              </div>
              <div class="menu-item" @click="handleMenuItemClick(logout)">
                <LogOut :size="16" />
                退出登录
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <router-link to="/signup" class="btn btn-outline btn-sm">注册</router-link>
          <router-link to="/login" class="btn btn-primary btn-sm">登录</router-link>
        </template>
      </div>
    </div>
  </header>

  <Profile v-if="showProfile" @close="showProfile = false" @refresh="loadProfile" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { PenLine, User, LogOut } from 'lucide-vue-next'
import Profile from '@/pages/Profile.vue'

const router = useRouter()
const authStore = useAuthStore()

const menuOpen = ref(false)
const showProfile = ref(false)

const user = computed(() => authStore.user)
const profile = ref(null)

// 优先从 profiles 表获取用户名，如果没有则从 user_metadata 或邮箱获取
const username = computed(() => {
  if (profile.value?.username) {
    return profile.value.username
  }
  return user.value?.user_metadata?.username || user.value?.email?.split('@')[0] || 'User'
})

// 优先从 profiles 表获取头像，如果没有则从 user_metadata 获取
const avatarUrl = computed(() => {
  if (profile.value?.avatar_url) {
    return profile.value.avatar_url
  }
  return user.value?.user_metadata?.avatar_url
})

// 加载用户资料
const loadProfile = async () => {
  if (!user.value) return

  try {
    const { supabase } = await import('@/supabase/client')
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url, username')
      .eq('id', user.value.id)

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

// 监听用户变化，加载资料
import { watch } from 'vue'

// 监听用户 ID 或 session 变化时重新加载 profile
watch(() => [user.value?.id, user.value?.updated_at], () => {
  if (user.value) {
    loadProfile()
  }
}, { immediate: true, deep: true })

// 添加一个方法，供外部调用刷新 profile
const refreshProfile = () => {
  loadProfile()
}

// 暴露给 Profile 组件使用
defineExpose({
  refreshProfile
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const handleMenuItemClick = (action) => {
  action()
  closeMenu()
}

const logout = async () => {
  await authStore.signOut()
  router.push('/')
}
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-left {
  flex-shrink: 0;
}

.brand {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: transform 0.3s;
}

.brand:hover {
  transform: scale(1.05);
}

.brand span {
  background: linear-gradient(135deg, #667eea 0%, #3b82f6 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-nav {
  flex: 1;
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  color: var(--muted);
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s;
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 12px;
}

.nav-link:hover {
  color: var(--accent);
  background: rgba(59, 130, 246, 0.1);
}

.nav-link.router-link-active {
  color: var(--accent);
  background: rgba(59, 130, 246, 0.15);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 3px;
  background: var(--gradient-blue);
  border-radius: 2px;
}

.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  transition: all 0.3s;
  background: rgba(59, 130, 246, 0.08);
  border: 2px solid transparent;
}

.user-info:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: var(--accent);
  transform: translateY(-2px);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--gradient-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--accent);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
}

.username {
  color: var(--text);
  font-weight: 700;
  font-size: 0.9rem;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .username {
    display: none;
  }
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid var(--border);
  border-radius: 16px;
  padding: 0.5rem;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  backdrop-filter: blur(10px);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  color: var(--text);
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s;
  font-weight: 600;
}

.menu-item:hover {
  background: var(--accent);
  color: #fff;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .header-nav {
    display: none;
  }
}
</style>
