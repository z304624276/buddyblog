import { supabase } from '@/supabase/client'

// 获取文章评论
export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey(
        id,
        username,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// 创建评论
export async function createComment(postId, authorId, content) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: authorId,
      content,
      status: 'approved'
    })
    .select(`
      *,
      author:profiles!comments_author_id_fkey(
        id,
        username,
        avatar_url
      )
    `)
    .single()

  if (error) throw error
  return data
}
