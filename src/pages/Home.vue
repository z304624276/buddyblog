<template>
  <div class="home">
    <Hero />
     <section class="tags-section">
      <div class="section-header">
        <h2>热门标签</h2>
      </div>

      <div v-if="tags.length > 0" class="tags-cloud">
        <TagPill
          v-for="tag in tags"
          :key="tag.id"
          :tag="tag"
          @click="selectedTag = tag.slug === selectedTag ? null : tag.slug"
        />
      </div>
    </section>

    <section class="featured-section">
      <div class="section-header">
        <h2>精选文章</h2>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="posts.length > 0" class="posts-grid">
        <PostCard
          v-for="post in posts.slice(0, 6)"
          :key="post.id"
          :post="post"
          :tags="post.tags_info || []"
        />
      </div>

      <div v-else class="empty-state">
        <FileText :size="64" />
        <p>暂无文章</p>
      </div>

      <div v-if="posts.length > 6" class="section-footer">
        <router-link to="/posts" class="btn btn-outline">
          查看更多
          <ArrowRight :size="16" />
        </router-link>
      </div>
    </section>

   
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchPosts, fetchTags } from '@/api/posts'
import Hero from '@/components/Hero.vue'
import PostCard from '@/components/PostCard.vue'
import TagPill from '@/components/TagPill.vue'
import { FileText, ArrowRight } from 'lucide-vue-next'

const router = useRouter()

const posts = ref([])
const tags = ref([])
const selectedTag = ref(null)
const loading = ref(true)

const loadPosts = async () => {
  try {
    loading.value = true
    posts.value = await fetchPosts(selectedTag.value)
  } catch (error) {
    console.error('Failed to load posts:', error)
  } finally {
    loading.value = false
  }
}

const loadTags = async () => {
  try {
    tags.value = await fetchTags()
  } catch (error) {
    console.error('Failed to load tags:', error)
  }
}

watch(selectedTag, () => {
  loadPosts()
})

onMounted(() => {
  loadPosts()
  loadTags()
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.featured-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color:var(--text);
  margin: 0;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-state svg {
  margin-bottom: 1rem;
  color: #4b5563;
}

.section-footer {
  text-align: center;
  margin-top: 2rem;
}

.tags-section {
  margin-bottom: 3rem;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
