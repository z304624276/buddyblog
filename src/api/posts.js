import { supabase, getPublicUrl } from '@/supabase/client'
import { estimateReadingMinutes, slugifyWithPinyin, generateUniqueFileName, isImageFile, checkFileSize } from '@/lib/utils'

// 根据 slug 获取标签 ID
async function getTagIdBySlug(slug) {
  const { data, error } = await supabase
    .from('tags')
    .select('id')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data.id
}

// 获取所有标签
export async function fetchTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

// 获取文章列表 (支持标签过滤)
export async function fetchPosts(tagSlug = null, keyword = null, startDate = null, endDate = null, sortBy = 'published_at_desc', status = 'published') {
  // 构建基础查询
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(
        id,
        username,
        avatar_url
      ),
      tags:tags_posts(
        tag_id,
        tag:tags(
          id,
          name,
          slug,
          color
        )
      )
    `)

  // 状态过滤（必须始终应用）
  if (status) {
    query = query.eq('status', status)
  }

  // 关键词搜索
  if (keyword && keyword.trim()) {
    const searchTerm = keyword.trim()
    // 使用 or() 方法进行多字段搜索
    query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
  }

  // 标签过滤
  if (tagSlug) {
    const tagId = await getTagIdBySlug(tagSlug)
    if (tagId) {
      query = query.contains('tags', [tagId])
    }
  }

  // 日期范围
  if (startDate) {
    query = query.gte('published_at', startDate)
  }
  if (endDate) {
    query = query.lte('published_at', endDate)
  }

  // 排序
  if (sortBy === 'published_at_asc') {
    query = query.order('published_at', { ascending: true })
  } else if (sortBy === 'created_at_desc') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('published_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) throw error

  // 转换标签数据格式
  const processedData = data.map(post => {
    let tags_info = []

    // 处理标签数据
    if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
      tags_info = post.tags
        .map(item => {
          if (item && item.tag) {
            return item.tag
          }
          return null
        })
        .filter(tag => tag && tag.id && tag.name)
    }

    return {
      ...post,
      tags_info
    }
  })

  return processedData
}

// 根据 slug 获取单篇文章
export async function fetchPostBySlug(slug) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(
        id,
        username,
        avatar_url
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) throw error

  // 获取标签
  if (data && data.tags && data.tags.length > 0) {
    const { data: tagsData } = await supabase
      .from('tags')
      .select('*')
      .in('id', data.tags)

    data.tags_info = tagsData || []
  }

  return data
}

// 获取当前用户的文章
export async function fetchMyPosts(userId) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 创建新文章
export async function createPost(payload) {
  const { cover, attachments, ...postData } = payload

  // 从当前认证用户获取 author_id
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('用户未认证')
  }

  const userId = user.id

  // 计算阅读时长
  const readingMinutes = estimateReadingMinutes(postData.content)

  // 生成 slug
  const slug = postData.slug || slugifyWithPinyin(postData.title)

  // 检查 slug 是否已存在
  const { data: existing, error: checkError } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)

  if (checkError) {
    console.error('检查 slug 失败:', checkError)
  }

  if (existing && existing.length > 0) {
    throw new Error('Slug already exists')
  }

  // 上传封面图片
  let coverUrl = null
  if (cover && isImageFile(cover)) {
    if (!checkFileSize(cover, 5)) {
      throw new Error('Cover image must be less than 5MB')
    }

    const fileName = `covers/${userId}/${generateUniqueFileName(cover.name)}`
    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, cover)

    if (uploadError) throw uploadError

    coverUrl = getPublicUrl('posts', fileName)
  }

  // 上传附件
  const attachmentUrls = []
  if (attachments && attachments.length > 0) {
    for (const file of attachments) {
      if (isImageFile(file)) {
        if (!checkFileSize(file, 8)) {
          throw new Error(`Attachment ${file.name} must be less than 8MB`)
        }

        const fileName = `attachments/${userId}/${generateUniqueFileName(file.name)}`
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        attachmentUrls.push(getPublicUrl('posts', fileName))
      }
    }
  }

  // 创建文章
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: postData.title,
      slug,
      excerpt: postData.excerpt,
      content: postData.content,
      status: postData.status,
      published_at: postData.published_at,
      published_tz: postData.published_tz,
      show_attachments: postData.show_attachments,
      cover_url: coverUrl,
      attachments: attachmentUrls,
      reading_minutes: readingMinutes,
      tags: postData.tags || [],
      author_id: userId
    })
    .select()

  if (error) {
    console.error('创建文章失败:', error)
    throw error
  }

  const newPost = data && data.length > 0 ? data[0] : null

  if (!newPost) {
    throw new Error('创建文章失败')
  }

  // 关联标签
  if (postData.tags && postData.tags.length > 0) {
    const tagRelations = postData.tags.map(tagId => ({
      post_id: newPost.id,
      tag_id: tagId
    }))

    await supabase.from('tags_posts').insert(tagRelations)
  }

  return newPost
}

// 更新文章
export async function updatePost(id, payload) {
  const { cover, attachments, ...postData } = payload

  // 从当前认证用户获取 author_id
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('用户未认证')
  }

  const userId = user.id

  // 计算阅读时长
  const readingMinutes = estimateReadingMinutes(postData.content)

  // 上传新的封面图片
  let coverUrl = postData.cover_url
  if (cover && isImageFile(cover)) {
    if (!checkFileSize(cover, 5)) {
      throw new Error('Cover image must be less than 5MB')
    }

    const fileName = `covers/${userId}/${generateUniqueFileName(cover.name)}`
    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, cover)

    if (uploadError) throw uploadError

    coverUrl = getPublicUrl('posts', fileName)
  }

  // 处理附件
  const attachmentUrls = postData.attachments || []
  if (attachments && attachments.length > 0) {
    for (const file of attachments) {
      if (isImageFile(file)) {
        if (!checkFileSize(file, 8)) {
          throw new Error(`Attachment ${file.name} must be less than 8MB`)
        }

        const fileName = `attachments/${userId}/${generateUniqueFileName(file.name)}`
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        attachmentUrls.push(getPublicUrl('posts', fileName))
      }
    }
  }

  // 更新文章
  const { data, error } = await supabase
    .from('posts')
    .update({
      title: postData.title,
      slug: postData.slug,
      excerpt: postData.excerpt,
      content: postData.content,
      status: postData.status,
      published_at: postData.published_at,
      published_tz: postData.published_tz,
      show_attachments: postData.show_attachments,
      cover_url: coverUrl,
      attachments: attachmentUrls,
      reading_minutes: readingMinutes,
      tags: postData.tags || []
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('更新文章失败:', error)
    throw error
  }

  const updatedPost = data && data.length > 0 ? data[0] : null

  if (!updatedPost) {
    throw new Error('更新文章失败')
  }

  // 更新标签关联
  if (postData.tags) {
    // 删除旧的标签关联
    await supabase.from('tags_posts').delete().eq('post_id', id)

    // 添加新的标签关联
    if (postData.tags.length > 0) {
      const tagRelations = postData.tags.map(tagId => ({
        post_id: id,
        tag_id: tagId
      }))

      await supabase.from('tags_posts').insert(tagRelations)
    }
  }

  return updatedPost
}

// 删除文章
export async function deletePost(id) {
  // 从当前认证用户获取 author_id
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('用户未认证')
  }

  const userId = user.id

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('author_id', userId)

  if (error) throw error
  return true
}

// 从附件中删除图片
export async function deleteAttachment(postId, attachmentUrl) {
  // 从数据库中删除
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('attachments')
    .eq('id', postId)

  if (fetchError) {
    console.error('获取文章失败:', fetchError)
    throw new Error('获取文章失败')
  }

  if (!post || post.length === 0) {
    throw new Error('Post not found')
  }

  const newAttachments = post[0].attachments.filter(url => url !== attachmentUrl)

  await supabase
    .from('posts')
    .update({ attachments: newAttachments })
    .eq('id', postId)

  // 从存储中删除文件 (可选)
  try {
    const path = attachmentUrl.split('/').slice(-2).join('/')
    await supabase.storage.from('posts').remove([path])
  } catch (err) {
    console.error('Failed to delete file from storage:', err)
  }

  return true
}
