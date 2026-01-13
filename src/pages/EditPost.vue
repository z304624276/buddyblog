<template>
  <div class="edit-post-page">
    <div class="page-header">
      <h1>编辑文章</h1>
      <div class="header-actions">
        <button @click="confirmDelete" class="btn btn-danger btn-sm">
          <Trash2 :size="14" />
          删除文章
        </button>
      </div>
    </div>

    <form v-if="post" @submit.prevent="handleSubmit" class="post-form">
      <div class="form-row">
        <div class="form-group">
          <label for="title">标题 *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="输入文章标题"
            required
          />
        </div>

        <div class="form-group">
          <label for="slug">URL 标识 (Slug)</label>
          <input
            id="slug"
            v-model="form.slug"
            type="text"
            disabled
            class="disabled"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="excerpt">摘要</label>
        <input
          id="excerpt"
          v-model="form.excerpt"
          type="text"
          placeholder="简短描述文章内容"
        />
      </div>

      <div class="form-group">
        <label>标签</label>
        <div class="tags-input">
          <TagPill
            v-for="tag in selectedTags"
            :key="tag.id"
            :tag="tag"
            @click="removeTag(tag.id)"
          />
          <select v-model="selectedTagId" @change="addTag" class="tag-select">
            <option value="">添加标签...</option>
            <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">
              {{ tag.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>封面图片 (最大 5MB)</label>
        <div class="file-upload">
          <div v-if="currentCoverUrl" class="file-preview">
            <img :src="currentCoverUrl" :alt="form.title" />
            <button type="button" @click="removeCover" class="btn-remove">
              <X :size="16" />
            </button>
          </div>
          <div v-else-if="form.cover" class="file-preview">
            <img :src="previewCover" :alt="form.title" />
            <button type="button" @click="removeCover" class="btn-remove">
              <X :size="16" />
            </button>
          </div>
          <label v-else for="cover-input" class="file-label">
            <Upload :size="32" />
            <span>点击上传封面</span>
          </label>
          <input
            id="cover-input"
            type="file"
            accept="image/*"
            @change="handleCoverUpload"
            class="hidden"
          />
        </div>
      </div>

      <div class="form-group">
        <label>附件图片 (最大 8MB)</label>
        <div class="file-upload">
          <div class="attachments-list">
            <div v-for="(url, index) in existingAttachments" :key="`existing-${index}`" class="attachment-item">
              <img :src="url" :alt="`Attachment ${index + 1}`" />
              <div class="attachment-actions">
                <button type="button" @click="copyUrl(url)" class="action-btn" title="复制 URL">
                  <Copy :size="14" />
                </button>
                <button type="button" @click="copyImgTag(url)" class="action-btn" title="复制 IMG 标签">
                  <ImageIcon :size="14" />
                </button>
                <button type="button" @click="deleteExistingAttachment(index)" class="action-btn" title="删除">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
            <div v-for="(file, index) in form.attachments" :key="`new-${index}`" class="attachment-item">
              <img :src="getAttachmentPreview(file)" :alt="file.name" />
              <button type="button" @click="removeAttachment(index)" class="btn-remove">
                <X :size="16" />
              </button>
            </div>
          </div>
          <label for="attachments-input" class="file-label">
            <Upload :size="32" />
            <span>点击上传附件 (可多选)</span>
          </label>
          <input
            id="attachments-input"
            type="file"
            accept="image/*"
            multiple
            @change="handleAttachmentsUpload"
            class="hidden"
          />
        </div>
      </div>

      <div class="form-group">
        <label>内容 *</label>
        <div class="editor-toolbar">
          <button type="button" @click="insertTag('b')" class="toolbar-btn" title="加粗">
            <Bold :size="16" />
          </button>
          <button type="button" @click="insertTag('i')" class="toolbar-btn" title="斜体">
            <Italic :size="16" />
          </button>
          <button type="button" @click="insertTag('h2')" class="toolbar-btn" title="标题">
            <Heading :size="16" />
          </button>
          <button type="button" @click="insertTag('p')" class="toolbar-btn" title="段落">
            <Pilcrow :size="16" />
          </button>
          <button type="button" @click="insertTag('ul')" class="toolbar-btn" title="无序列表">
            <List :size="16" />
          </button>
          <button type="button" @click="insertTag('ol')" class="toolbar-btn" title="有序列表">
            <ListOrdered :size="16" />
          </button>
          <button type="button" @click="insertTag('blockquote')" class="toolbar-btn" title="引用">
            <Quote :size="16" />
          </button>
          <button type="button" @click="insertTag('code')" class="toolbar-btn" title="代码">
            <Code :size="16" />
          </button>
        </div>
        <textarea
          id="content"
          v-model="form.content"
          placeholder="输入文章内容 (支持 HTML)"
          required
          class="content-editor"
          rows="15"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="status">状态</label>
          <select id="status" v-model="form.status">
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已归档</option>
          </select>
        </div>

        <div class="form-group">
          <label for="readingMinutes">阅读时长 (分钟)</label>
          <input
            id="readingMinutes"
            v-model.number="form.readingMinutes"
            type="number"
            min="0"
          />
        </div>
      </div>

      <div class="form-row" v-if="form.status === 'published'">
        <div class="form-group">
          <label for="publishedAt">发布时间</label>
          <input
            id="publishedAt"
            v-model="form.publishedAt"
            type="datetime-local"
          />
        </div>

        <div class="form-group">
          <label for="publishedTz">时区</label>
          <select id="publishedTz" v-model="form.publishedTz">
            <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="form.showAttachments" />
          显示附件图片
        </label>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-actions">
        <button type="button" @click="preview" class="btn btn-outline">
          <Eye :size="16" />
          预览
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '保存中...' : '保存修改' }}
        </button>
      </div>
    </form>

    <div v-else-if="!loading" class="error-state">
      <AlertCircle :size="64" />
      <h2>文章未找到</h2>
      <router-link to="/my-posts" class="btn btn-primary">返回我的文章</router-link>
    </div>

    <!-- 预览模态框 -->
    <div v-if="showPreview" class="modal-overlay" @click.self="showPreview = false">
      <div class="modal preview-modal">
        <div class="modal-header">
          <h2>预览</h2>
          <button @click="showPreview = false" class="btn-close">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <div class="preview-content" v-html="form.content"></div>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h2>确认删除</h2>
        </div>
        <div class="modal-body">
          <p>确定要删除这篇文章吗？此操作无法撤销。</p>
          <div class="confirm-actions">
            <button @click="showDeleteConfirm = false" class="btn btn-outline">取消</button>
            <button @click="deletePost" class="btn btn-danger">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchPostBySlug, fetchTags, updatePost, deletePost as deletePostApi, deleteAttachment } from '@/api/posts'
import { useAuthStore } from '@/stores/auth'
import { estimateReadingMinutes, copyToClipboard } from '@/lib/utils'
import TagPill from '@/components/TagPill.vue'
import { X, Upload, Bold, Italic, Heading, Pilcrow, List, ListOrdered, Quote, Code, Eye, Trash2, Copy, ImageIcon, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const post = ref(null)
const form = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover: null,
  attachments: [],
  tags: [],
  status: 'draft',
  readingMinutes: 0,
  publishedAt: '',
  publishedTz: 'Asia/Shanghai',
  showAttachments: false,
  author_id: authStore.user?.id
})

const tags = ref([])
const selectedTags = ref([])
const selectedTagId = ref('')
const loading = ref(true)
const error = ref('')
const showPreview = ref(false)
const showDeleteConfirm = ref(false)

const existingAttachments = ref([])

const availableTags = computed(() => {
  return tags.value.filter(tag => !selectedTags.value.some(st => st.id === tag.id))
})

const currentCoverUrl = computed(() => {
  return post.value?.cover_url || ''
})

const previewCover = computed(() => {
  if (form.value.cover) {
    return URL.createObjectURL(form.value.cover)
  }
  return ''
})

const addTag = () => {
  if (selectedTagId.value) {
    const tag = tags.value.find(t => t.id === selectedTagId.value)
    if (tag) {
      selectedTags.value.push(tag)
      form.value.tags.push(tag.id)
    }
    selectedTagId.value = ''
  }
}

const removeTag = (tagId) => {
  selectedTags.value = selectedTags.value.filter(t => t.id !== tagId)
  form.value.tags = form.value.tags.filter(t => t !== tagId)
}

const handleCoverUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.cover = file
  }
}

const removeCover = () => {
  form.value.cover = null
}

const handleAttachmentsUpload = (event) => {
  const files = Array.from(event.target.files)
  form.value.attachments = [...form.value.attachments, ...files]
}

const removeAttachment = (index) => {
  form.value.attachments.splice(index, 1)
}

const getAttachmentPreview = (file) => {
  return URL.createObjectURL(file)
}

const insertTag = (tag) => {
  const textarea = document.getElementById('content')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = form.value.content

  const tagsMap = {
    b: `<b>${text.substring(start, end)}</b>`,
    i: `<i>${text.substring(start, end)}</i>`,
    h2: `<h2>${text.substring(start, end)}</h2>`,
    p: `<p>${text.substring(start, end)}</p>`,
    ul: `<ul><li>${text.substring(start, end)}</li></ul>`,
    ol: `<ol><li>${text.substring(start, end)}</li></ol>`,
    blockquote: `<blockquote>${text.substring(start, end)}</blockquote>`,
    code: `<pre><code>${text.substring(start, end)}</code></pre>`
  }

  form.value.content = text.substring(0, start) + tagsMap[tag] + text.substring(end)

  textarea.focus()
  textarea.selectionStart = textarea.selectionEnd = start + tagsMap[tag].length
}

const preview = () => {
  showPreview.value = true
}

const copyUrl = async (url) => {
  const success = await copyToClipboard(url)
  if (success) {
    alert('URL 已复制到剪贴板')
  }
}

const copyImgTag = async (url) => {
  const success = await copyToClipboard(`<img src="${url}" />`)
  if (success) {
    alert('IMG 标签已复制到剪贴板')
  }
}

const deleteExistingAttachment = async (index) => {
  const url = existingAttachments.value[index]
  try {
    await deleteAttachment(post.value.id, url)
    existingAttachments.value.splice(index, 1)
  } catch (error) {
    console.error('Failed to delete attachment:', error)
    alert('删除附件失败')
  }
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const deletePost = async () => {
  try {
    await deletePostApi(post.value.id)
    router.push('/my-posts')
  } catch (error) {
    console.error('Failed to delete post:', error)
    alert('删除文章失败')
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    if (form.value.readingMinutes === 0) {
      form.value.readingMinutes = estimateReadingMinutes(form.value.content)
    }

    // 合并现有附件和新附件
    const allAttachments = [...existingAttachments.value]
    await updatePost(post.value.id, {
      ...form.value,
      attachments: allAttachments,
      published_at: form.value.publishedAt || null,
      published_tz: form.value.publishedTz || null,
      show_attachments: form.value.showAttachments
    })

    router.push('/my-posts')
  } catch (err) {
    error.value = err.message || '保存失败，请重试'
  } finally {
    loading.value = false
  }
}

const loadPost = async () => {
  try {
    loading.value = true
    post.value = await fetchPostBySlug(route.params.slug)

    // 填充表单
    form.value = {
      title: post.value.title,
      slug: post.value.slug,
      excerpt: post.value.excerpt || '',
      content: post.value.content,
      cover: null,
      attachments: [],
      tags: post.value.tags || [],
      status: post.value.status,
      readingMinutes: post.value.reading_minutes || 0,
      publishedAt: post.value.published_at ? post.value.published_at.slice(0, 16) : '',
      publishedTz: post.value.published_tz || 'Asia/Shanghai',
      showAttachments: post.value.show_attachments || false,
      author_id: authStore.user?.id
    }

    existingAttachments.value = post.value.attachments || []

    // 加载标签信息
    if (post.value.tags_info) {
      selectedTags.value = post.value.tags_info
    }
  } catch (error) {
    console.error('Failed to load post:', error)
    post.value = null
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

onMounted(() => {
  loadPost()
  loadTags()
})
</script>

<style scoped>
.edit-post-page {
  max-width: 900px;
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

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.post-form {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid var(--border);
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
  position: relative;
  overflow: hidden;
}

.post-form::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  position: relative;
  z-index: 1;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="datetime-local"],
.form-group select,
.form-group textarea {
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--border);
  border-radius: 16px;
  color: var(--text);
  font-size: 0.95rem;
  transition: all 0.3s;
  font-weight: 500;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.form-group input.disabled {
  background: rgba(240, 247, 255, 0.5);
  cursor: not-allowed;
  color: var(--muted);
  border-color: var(--border);
}

.form-group textarea {
  font-family: 'Nunito', monospace;
  line-height: 1.6;
  resize: vertical;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}

.tag-select {
  padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;
}

.tag-select:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.file-upload {
  border: 3px dashed var(--border);
  border-radius: 20px;
  padding: 1.5rem;
  transition: all 0.3s;
  background: rgba(240, 247, 255, 0.5);
}

.file-upload:hover {
  border-color: var(--accent);
  background: rgba(240, 247, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
}

.file-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.file-label:hover {
  color: var(--accent);
  transform: scale(1.05);
}

.file-preview,
.attachments-list {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.attachment-item,
.file-preview > div {
  position: relative;
}

.attachment-item img,
.file-preview img {
  width: 200px;
  height: auto;
  border-radius: 16px;
  object-fit: cover;
  border: 2px solid var(--border);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.attachment-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: #fff;
  padding: 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.btn-remove {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  border: 2px solid #fff;
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(238, 90, 111, 0.4);
}

.btn-remove:hover {
  transform: scale(1.15) rotate(90deg);
  box-shadow: 0 4px 12px rgba(238, 90, 111, 0.5);
}

.hidden {
  display: none;
}

.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.6rem;
  background: rgba(240, 247, 255, 0.8);
  border: 2px solid var(--border);
  border-radius: 16px 16px 0 0;
}

.toolbar-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--border);
  color: var(--text);
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.toolbar-btn:hover {
  background: var(--accent);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.content-editor {
  border-radius: 0 0 16px 16px !important;
  border-top: none !important;
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

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

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
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 12px 48px rgba(59, 130, 246, 0.2);
}

.preview-modal {
  max-width: 800px;
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

.preview-content {
  color: var(--text);
  line-height: 1.8;
  font-weight: 500;
}

.preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  margin: 1.5rem 0;
  border: 2px solid var(--border);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
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
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>
