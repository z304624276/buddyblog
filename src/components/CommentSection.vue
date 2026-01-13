<template>
  <div class="comment-section">
    <h3>评论 ({{ comments.length }})</h3>

    <!-- 评论表单 -->
    <form v-if="user" @submit.prevent="handleSubmit" class="comment-form">
      <textarea
        v-model="content"
        placeholder="写下你的评论..."
        rows="4"
        required
        maxlength="1000"
        class="comment-textarea"
        :disabled="loading"
      />
      <div class="comment-footer">
        <span class="char-count" :class="{ warning: content.length > 800, danger: content.length > 950 }">
          {{ content.length }}/1000
        </span>
        <button type="submit" class="btn btn-primary" :disabled="loading || !content.trim()">
          {{ loading ? '提交中...' : '发表评论' }}
        </button>
      </div>
    </form>

    <div v-else class="comment-login-prompt">
      <router-link to="/login" class="btn btn-primary btn-sm">
        登录后发表评论
      </router-link>
    </div>

    <!-- 评论列表 -->
    <div v-if="comments.length > 0" class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">
          <img
            v-if="comment.author?.avatar_url"
            :src="comment.author.avatar_url"
            :alt="comment.author.username"
          />
          <div v-else class="avatar-placeholder">
            {{ (comment.author?.username || 'U').charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author?.username || 'Unknown' }}</span>
            <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
          </div>
          <p class="comment-text" v-text="comment.content"></p>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="no-comments">
      暂无评论，快来发表第一条评论吧！
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { fetchComments, createComment } from '@/api/comments'
import { formatDate } from '@/lib/utils'

const props = defineProps({
  postId: {
    type: String,
    required: true
  }
})

const authStore = useAuthStore()

const comments = ref([])
const content = ref('')
const loading = ref(false)
const user = computed(() => authStore.user)

const loadComments = async () => {
  try {
    loading.value = true
    comments.value = await fetchComments(props.postId)
  } catch (error) {
    console.error('Failed to load comments:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!user.value) return

  // 验证评论内容长度
  const trimmedContent = content.value.trim()
  if (trimmedContent.length === 0) {
    alert('评论内容不能为空')
    return
  }
  if (trimmedContent.length > 1000) {
    alert('评论内容不能超过 1000 字符')
    return
  }

  try {
    loading.value = true
    const newComment = await createComment(
      props.postId,
      user.value.id,
      trimmedContent
    )
    comments.value.push(newComment)
    content.value = ''
  } catch (error) {
    console.error('Failed to create comment:', error)
    alert('发表评论失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-section {
  margin-top: 2rem;
  padding: 2rem 2em 0 2em;
  border-top: 2px solid var(--border);
}

.comment-section h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 1.8rem 0;
  background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.comment-form {
  margin-bottom: 2.5rem;
}

.comment-textarea {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--border);
  border-radius: 16px;
  color: var(--text);
  font-size: 0.95rem;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  font-weight: 500;
  transition: all 0.3s;
}

.comment-textarea::placeholder {
  color: var(--muted);
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.comment-form .btn {
  margin-left: auto;
}

.comment-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.9rem;
}

.char-count {
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 500;
}

.char-count.warning {
  color: #f59e0b;
}

.char-count.danger {
  color: #ef4444;
}

.comment-login-prompt {
  text-align: center;
  padding: 2rem;
  background: rgba(240, 247, 255, 0.5);
  border: 2px solid var(--border);
  border-radius: 20px;
  font-weight: 600;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.comment-item {
  display: flex;
  gap: 1.2rem;
  padding: 1.5rem;
  background: rgba(240, 247, 255, 0.3);
  border-radius: 20px;
  border: 2px solid var(--border);
  transition: all 0.3s;
}

.comment-item:hover {
  background: rgba(240, 247, 255, 0.6);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
  transform: translateY(-2px);
}

.comment-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%);
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  flex-shrink: 0;
}

.comment-avatar img {
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
  font-size: 1.1rem;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
}

.comment-author {
  font-weight: 700;
  color: var(--text);
  font-size: 1rem;
}

.comment-date {
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.3rem 0.6rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.comment-text {
  color: var(--text);
  margin: 0;
  line-height: 1.7;
  font-weight: 500;
}

.no-comments {
  text-align: center;
  color: var(--muted);
  padding: 2.5rem;
  background: rgba(240, 247, 255, 0.3);
  border-radius: 20px;
  border: 2px dashed var(--border);
  font-weight: 600;
  margin-bottom: 2em;
}
</style>
