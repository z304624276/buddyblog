<template>
  <div class="my-posts-page">
    <div class="page-header">
      <h1>我的文章</h1>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="posts.length > 0" class="posts-list">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-item"
      >
        <div class="post-info">
          <h3>{{ post.title }}</h3>
          <div class="post-meta">
            <span class="status-badge" :class="`status-${post.status}`">
              {{ getStatusText(post.status) }}
            </span>
            <span class="post-date">{{ formatDate(post.created_at) }}</span>
          </div>
        </div>

        <div class="post-actions">
          <router-link :to="`/post/${post.slug}/edit`" class="btn btn-outline btn-sm">
            <Edit2 :size="14" />
            编辑
          </router-link>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <FileText :size="64" />
      <p>还没有文章</p>
      <router-link to="/dashboard" class="btn btn-primary">
        <Plus :size="16" />
        创建第一篇文章
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMyPosts } from '@/api/posts'
import { useAuthStore } from '@/stores/auth'
import { FileText, Edit2, Plus } from 'lucide-vue-next'
import { formatDate } from '@/lib/utils'

const router = useRouter()
const authStore = useAuthStore()

const posts = ref([])
const loading = ref(true)

const user = computed(() => authStore.user)

const loadPosts = async () => {
  if (!user.value) {
    router.push('/login')
    return
  }

  try {
    loading.value = true
    posts.value = await fetchMyPosts(user.value.id)
  } catch (error) {
    console.error('Failed to load posts:', error)
  } finally {
    loading.value = false
  }
}

const getStatusText = (status) => {
  const statusMap = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return statusMap[status] || status
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.my-posts-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--muted);
  font-weight: 600;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.post-item {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid var(--border);
  border-radius: 20px;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.post-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--accent) 0%, var(--secondary) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.post-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.post-item:hover::before {
  opacity: 1;
}

.post-info {
  flex: 1;
}

.post-info h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.6rem 0;
}

.post-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.status-badge {
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.3s;
}

.status-draft {
  background: rgba(156, 163, 175, 0.15);
  color: #6b7280;
  border: 2px solid rgba(156, 163, 175, 0.3);
}

.status-published {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  border: 2px solid rgba(16, 185, 129, 0.3);
}

.status-archived {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
  border: 2px solid rgba(239, 68, 68, 0.3);
}

.status-badge:hover {
  transform: scale(1.05);
}

.post-date {
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 500;
}

.post-actions {
  display: flex;
  gap: 0.6rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--muted);
}

.empty-state svg {
  margin-bottom: 1rem;
  color: var(--border);
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .post-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
