import { defineStore } from 'pinia'
import { supabase } from '@/supabase/client'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: true
  }),

  actions: {
    async initialize() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        this.session = session
        this.user = session?.user ?? null

        supabase.auth.onAuthStateChange((event, session) => {
          this.session = session
          this.user = session?.user ?? null
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        this.loading = false
      }
    },

    async signIn(usernameOrEmail, password) {
      // 判断是用户名还是邮箱
      const isEmail = usernameOrEmail.includes('@')

      let email = usernameOrEmail

      // 如果是用户名，先查找对应的邮箱
      if (!isEmail) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', usernameOrEmail)

        if (profileError) {
          console.error('查询用户失败:', profileError)
          throw new Error('用户名或密码错误')
        }

        if (!profiles || profiles.length === 0) {
          throw new Error('用户名或密码错误')
        }

        email = profiles[0].email
      }

      // 使用邮箱密码登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // 设置 24 小时后过期
          expiresIn: 86400 // 24 小时 = 86400 秒
        }
      })

      if (error) throw error

      this.session = data.session
      this.user = data.user

      return data
    },

    async signUp(email, password, username) {
      // 检查用户名是否已存在
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)

      if (!checkError && existingUsers && existingUsers.length > 0) {
        throw new Error('用户名已被占用')
      }

      // 注册用户（profiles 会通过数据库触发器自动创建）
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      // 注册成功后立即登录，跳过邮件确认
      if (data.user) {
        const { error: signInError } = await this.signIn(email, password)
        if (signInError) {
          console.error('自动登录失败:', signInError)
          throw new Error('注册成功，但自动登录失败，请手动登录')
        }
      }

      return data
    },

    async signOut() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('退出登录失败:', error)
          throw error
        }

        this.user = null
        this.session = null
      } catch (error) {
        console.error('signOut error:', error)
        // 即使失败也要清空用户状态
        this.user = null
        this.session = null
        throw error
      }
    },

    async updatePassword(currentPassword, newPassword) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 验证当前密码
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (signInError) throw new Error('Current password is incorrect')

      // 更新密码
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return true
    },

    async updateProfile(updates) {
      if (!this.user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', this.user.id)

      if (error) throw error

      return true
    },

    async uploadAvatar(file) {
      if (!this.user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${this.user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const avatarUrl = `https://${import.meta.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0]}.supabase.co/storage/v1/object/public/avatars/${fileName}`

      await this.updateProfile({ avatar_url: avatarUrl })

      // 刷新用户信息以更新 user_metadata
      await this.refreshUser()

      return avatarUrl
    },

    async refreshUser() {
      if (!this.user) return

      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error('刷新用户信息失败:', error)
        return
      }

      this.user = data.user
      this.session = data.session
    }
  }
})
