import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/Home.vue')
    },
    {
      path: '/posts',
      name: 'posts',
      component: () => import('@/pages/Posts.vue')
    },
    {
      path: '/post/:slug',
      name: 'post-detail',
      component: () => import('@/pages/PostDetail.vue')
    },
    {
      path: '/post/:slug/edit',
      name: 'edit-post',
      component: () => import('@/pages/EditPost.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Login.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/pages/Signup.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-posts',
      name: 'my-posts',
      component: () => import('@/pages/MyPosts.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('@/pages/Account.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFound.vue')
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 初始化认证状态
  if (authStore.loading) {
    await authStore.initialize()
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.user) {
    // 保存目标路由以便登录后重定向
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
