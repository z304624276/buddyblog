import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 创建 Supabase 客户端，设置 24 小时 token 有效期
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 设置会话持久化
    persistSession: true,
    // 自动刷新 token
    autoRefreshToken: true,
    // 检测 session 类型
    detectSessionInUrl: true,
    // 设置 token 刷新前的时间（24小时 = 86400秒）
    maxSessionAge: 86400
  }
})

// 获取公开文件URL
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
