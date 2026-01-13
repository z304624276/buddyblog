<template>
  <router-link :to="`/post/${post.slug}`" class="post-card">
    <div class="post-cover">
      <img v-if="post.cover_url" :src="post.cover_url" :alt="post.title" />
      <div v-else class="post-cover-placeholder">
        <FileText :size="48" />
      </div>
    </div>

    <div class="post-content">
      <div class="post-meta">
        <span class="post-reading-time">
          <Clock :size="14" />
          {{ post.reading_minutes || 0 }} 分钟阅读
        </span>
        <span class="post-date">
          <Calendar :size="14" />
          {{ formatDate(post.published_at) }}
        </span>
      </div>

      <h3 class="post-title">{{ post.title }}</h3>

      <div v-if="tags && tags.length > 0" class="post-tags">
        <TagPill
          v-for="tag in tags.slice(0, 3)"
          :key="tag.id"
          :tag="tag"
          @click.stop
        />
      </div>

      <p class="post-excerpt">{{ truncateText(post.excerpt || stripHtml(post.content), 150) }}</p>

      <div class="post-footer">
        <div class="post-author">
          <img
            v-if="post.author?.avatar_url"
            :src="post.author.avatar_url"
            :alt="post.author.username"
            class="author-avatar"
          />
          <div v-else class="author-avatar-placeholder">
            {{ (post.author?.username || 'U').charAt(0).toUpperCase() }}
          </div>
          <span>{{ post.author?.username || 'Unknown' }}</span>
        </div>

        <span class="read-more">
          阅读更多
          <ArrowRight :size="14" />
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, Calendar, FileText, ArrowRight } from 'lucide-vue-next'
import TagPill from './TagPill.vue'
import { formatDate, truncateText, stripHtml } from '@/lib/utils'

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  tags: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.post-card {
  display: block;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid var(--border);
  border-radius: 24px;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
  position: relative;
}

.post-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-blue);
  transform: scaleX(0);
  transition: transform 0.3s;
}

.post-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: var(--accent);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.2);
}

.post-card:hover::after {
  transform: scaleX(1);
}

.post-cover {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f7ff 100%);
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-card:hover .post-cover img {
  transform: scale(1.1);
}

.post-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
}

.post-content {
  padding: 1.8rem;
}

.post-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.post-reading-time,
.post-date {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 8px;
}

.post-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.post-excerpt {
  color: var(--muted);
  margin: 0 0 1rem 0;
  line-height: 1.7;
  font-size: 0.95rem;
  font-weight: 500;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 2px solid var(--border);
}

.post-author {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 600;
}

.author-avatar,
.author-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--accent);
}

.author-avatar-placeholder {
  background: var(--gradient-blue);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--accent);
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.3s;
}

.read-more:hover {
  color: var(--accent-2);
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .post-title {
    font-size: 1.15rem;
  }

  .post-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
