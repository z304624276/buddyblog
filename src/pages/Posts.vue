<template>
  <div class="posts-page">
    <div class="page-header">
      <h1>所有文章</h1>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <div class="filter-group">
        <label>搜索</label>
        <input
          v-model="filters.keyword"
          type="text"
          placeholder="关键词..."
          @input="debouncedSearch"
        />
      </div>

      <div class="filter-group">
        <label>标签</label>
        <select v-model="filters.tagSlug" @change="applyFilters">
          <option value="">全部标签</option>
          <option v-for="tag in tags" :key="tag.id" :value="tag.slug">
            {{ tag.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>开始日期</label>
        <input
          v-model="filters.startDate"
          type="date"
          @change="applyFilters"
        />
      </div>

      <div class="filter-group">
        <label>结束日期</label>
        <input
          v-model="filters.endDate"
          type="date"
          @change="applyFilters"
        />
      </div>

      <div class="filter-group">
        <label>排序</label>
        <select v-model="filters.sortBy" @change="applyFilters">
          <option value="published_at_desc">最新发布</option>
          <option value="published_at_asc">最早发布</option>
          <option value="created_at_desc">最新创建</option>
        </select>
      </div>

      <button @click="resetFilters" class="btn btn-outline">
        重置
      </button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="posts.length > 0" class="posts-grid">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :tags="post.tags_info || []"
      />
    </div>

    <div v-else class="empty-state">
      <FileText :size="64" />
      <p>没有找到文章</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchPosts, fetchTags } from '@/api/posts'
import PostCard from '@/components/PostCard.vue'
import { FileText } from 'lucide-vue-next'
import { useDebounceFn } from '@vueuse/core'

const posts = ref([])
const tags = ref([])
const loading = ref(true)

const filters = ref({
  keyword: '',
  tagSlug: '',
  startDate: '',
  endDate: '',
  sortBy: 'published_at_desc'
})

const applyFilters = async () => {
  try {
    loading.value = true
    posts.value = await fetchPosts(
      filters.value.tagSlug || null,
      filters.value.keyword || null,
      filters.value.startDate || null,
      filters.value.endDate || null,
      filters.value.sortBy
    )
  } catch (error) {
    console.error('Failed to load posts:', error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn(applyFilters, 300)

const resetFilters = () => {
  filters.value = {
    keyword: '',
    tagSlug: '',
    startDate: '',
    endDate: '',
    sortBy: 'published_at_desc'
  }
  applyFilters()
}

const loadTags = async () => {
  try {
    tags.value = await fetchTags()
  } catch (error) {
    console.error('Failed to load tags:', error)
  }
}

onMounted(() => {
  applyFilters()
  loadTags()
})
</script>

<style scoped>
.posts-page {
  max-width: 1200px;
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

.filters {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--border);
  border-radius: 24px;
  padding: 1.8rem;
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: end;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08);
  position: relative;
  overflow: hidden;
}

.filters::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
  min-width: 150px;
  position: relative;
  z-index: 1;
}

.filter-group label {
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 700;
}

.filter-group input,
.filter-group select {
  padding: 0.6rem 0.9rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.8rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--muted);
  font-weight: 600;
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

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
