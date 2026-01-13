import { pinyin } from 'pinyin-pro'

// 生成 URL 友好的 slug
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 使用拼音生成 slug (支持中文)
export function slugifyWithPinyin(text) {
  const pinyinResult = pinyin(text, { toneType: 'none', type: 'array' })
  const pinyinText = pinyinResult.join(' ')
  return slugify(pinyinText)
}

// 确保 slug 格式正确
export function ensureSlug(slug) {
  if (!slug) return ''
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 格式化日期
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 估算阅读时长 (基于内容长度)
export function estimateReadingMinutes(content) {
  if (!content) return 0
  // 移除 HTML 标签
  const text = content.replace(/<[^>]*>/g, '')
  // 假设平均阅读速度为每分钟 400 个字符 (中文)
  const characters = text.length
  return Math.ceil(characters / 400)
}

// 转换时区
export function convertToTimezone(date, timezone = 'Asia/Shanghai') {
  if (!date) return null
  return new Date(date).toLocaleString('zh-CN', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// 检查文件类型
export function isImageFile(file) {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  return imageTypes.includes(file.type)
}

// 检查文件大小限制
export function checkFileSize(file, maxSizeInMB) {
  const maxSize = maxSizeInMB * 1024 * 1024
  return file.size <= maxSize
}

// 生成唯一文件名
export function generateUniqueFileName(originalName) {
  const ext = originalName.split('.').pop()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  // 只使用时间戳和随机数，不保留原始文件名，避免特殊字符问题
  return `${timestamp}-${random}.${ext}`
}

// 复制文本到剪贴板
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

// 截取摘要
export function truncateText(text, maxLength = 200) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// 移除 HTML 标签
export function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// 验证邮箱格式
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// 验证密码强度
export function isStrongPassword(password) {
  // 至少 6 个字符
  if (password.length < 6) return false
  return true
}

// 生成随机颜色
export function generateRandomColor() {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
