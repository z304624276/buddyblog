<template>
  <div class="post-detail">
    <div v-if="loading" class="loading">加载中...</div>

    <article v-else-if="post" class="post-article">
      <!-- 封面图片 -->
      <div v-if="post.cover_url" class="post-cover">
        <img :src="post.cover_url" :alt="post.title" />
      </div>

      <!-- 标题和元信息 -->
      <div class="post-header">
        <h1>{{ post.title }}</h1>

        <div class="post-meta">
          <span class="meta-item">
            <User :size="16" />
            {{ post.author?.username || 'Unknown' }}
          </span>
          <span class="meta-item">
            <Calendar :size="16" />
            {{ formatDate(post.published_at) }}
          </span>
          <span class="meta-item">
            <Clock :size="16" />
            {{ post.reading_minutes || 0 }} 分钟阅读
          </span>
        </div>

        <div v-if="post.tags_info && post.tags_info.length > 0" class="post-tags">
          <TagPill
            v-for="tag in post.tags_info"
            :key="tag.id"
            :tag="tag"
          />
        </div>

        <div v-if="user?.id === post.author_id" class="post-actions">
          <router-link :to="`/post/${post.slug}/edit`" class="btn btn-outline btn-sm">
            <Edit2 :size="14" />
            编辑
          </router-link>
        </div>
      </div>

      <!-- 内容 -->
      <div class="post-content" v-html="post.content"></div>

      <!-- 附件 -->
      <div v-if="post.attachments && post.attachments.length > 0 && post.show_attachments" class="post-attachments">
        <h3>附件图片</h3>
        <div class="attachments-grid">
          <img
            v-for="(url, index) in post.attachments"
            :key="index"
            :src="url"
            :alt="`Attachment ${index + 1}`"
          />
        </div>
      </div>

      <!-- 评论区 -->
      <CommentSection :post-id="post.id" />
    </article>

    <div v-else class="error-state">
      <AlertCircle :size="64" />
      <h2>文章未找到</h2>
      <router-link to="/posts" class="btn btn-primary">返回文章列表</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPostBySlug } from '@/api/posts'
import { useAuthStore } from '@/stores/auth'
import CommentSection from '@/components/CommentSection.vue'
import TagPill from '@/components/TagPill.vue'
import { User, Calendar, Clock, Edit2, AlertCircle } from 'lucide-vue-next'
import { formatDate } from '@/lib/utils'

const route = useRoute()
const authStore = useAuthStore()

const post = ref(null)
const loading = ref(true)

const user = computed(() => authStore.user)

const loadPost = async () => {
  try {
    loading.value = true
    post.value = await fetchPostBySlug(route.params.slug)
  } catch (error) {
    console.error('Failed to load post:', error)
    post.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.post-detail {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--muted);
  font-weight: 600;
}

.post-article {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid var(--border);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
  position: relative;
}

.post-article::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.post-cover {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  position: relative;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.post-cover:hover img {
  transform: scale(1.03);
}

.post-header {
  padding: 2.5rem;
  border-bottom: 2px solid var(--border);
  position: relative;
  z-index: 1;
}

.post-header h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 1.2rem 0;
  line-height: 1.3;
  background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.2rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  background: rgba(240, 247, 255, 0.5);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.post-tags {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.post-actions {
  display: flex;
  gap: 0.75rem;
}

.post-content {
  padding: 2.5rem;
  color: var(--text);
  line-height: 1.9;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 20px;
  margin: 2rem 0;
  border: 2px solid var(--border);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
}

.post-content :deep(h2),
.post-content :deep(h3),
.post-content :deep(h4) {
  color: var(--text);
  margin-top: 2.5rem;
  margin-bottom: 1.2rem;
  font-weight: 700;
}

.post-content :deep(h2) {
  font-size: 1.8rem;
}

.post-content :deep(h3) {
  font-size: 1.5rem;
}

.post-content :deep(p) {
  margin-bottom: 1.2rem;
}

.post-content :deep(code) {
  background: rgba(240, 247, 255, 0.8);
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-family: 'Nunito', monospace;
  font-size: 0.9rem;
  color: var(--accent);
  border: 1px solid var(--border);
  font-weight: 600;
}

.post-content :deep(pre) {
  background: rgba(240, 247, 255, 0.8);
  padding: 1.5rem;
  border-radius: 16px;
  overflow-x: auto;
  margin: 2rem 0;
  border: 2px solid var(--border);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
}

.post-content :deep(pre code) {
  background: none;
  padding: 0;
  border: none;
  color: var(--text);
}

.post-content :deep(blockquote) {
  border-left: 4px solid var(--accent);
  padding-left: 1.5rem;
  margin: 2rem 0;
  color: var(--muted);
  font-style: italic;
  background: rgba(240, 247, 255, 0.5);
  padding: 1.5rem;
  border-radius: 0 16px 16px 0;
}

.post-content :deep(ul),
.post-content :deep(ol) {
  padding-left: 2rem;
  margin-bottom: 1.5rem;
}

.post-content :deep(li) {
  margin-bottom: 0.6rem;
  position: relative;
}

.post-content :deep(li::marker) {
  color: var(--accent);
  font-weight: 700;
}

.post-attachments {
  padding: 2.5rem;
  border-top: 2px solid var(--border);
  position: relative;
  z-index: 1;
}

.post-attachments h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 1.5rem 0;
  background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.attachments-grid img {
  width: 100%;
  height: auto;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid var(--border);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
}

.attachments-grid img:hover {
  transform: scale(1.05) translateY(-5px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
}

.error-state {
  text-align: center;
  padding: 3rem;
  color: var(--muted);
}

.error-state svg {
  margin-bottom: 1rem;
  color: var(--border);
}

.error-state h2 {
  font-size: 1.5rem;
  color: var(--text);
  margin: 0 0 1rem 0;
  font-weight: 700;
}

@media (max-width: 768px) {
  .post-header h1 {
    font-size: 1.6rem;
  }

  .post-meta {
    gap: 0.75rem;
  }

  .post-content {
    padding: 1.8rem;
  }

  .post-attachments {
    padding: 1.8rem;
  }
}
</style>
