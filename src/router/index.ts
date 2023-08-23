import { createRouter, createWebHashHistory } from 'vue-router'

// 创建 router 实例
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: 'login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue')
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/error/index.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/test/index.vue')
    },
    {
      path: '/layout',
      name: 'layout',
      component: () => import('@/views/layout/index.vue'),
      children: []
    },
    {
      path: '/:catchAll(.*)',
      component: () => import('@/views/error/index.vue')
    }
  ]
})

export default router
