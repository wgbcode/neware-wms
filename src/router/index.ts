import { createRouter, createWebHistory } from 'vue-router'

// 创建 router 实例
const staticURL = import.meta.env.VITE_STATIC_URL
const newURL = import.meta.env.BASE_URL.replace(staticURL, '')
const router = createRouter({
  history: createWebHistory(newURL),
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
      path: '/selectCompany',
      name: 'selectCompany',
      component: () => import('@/views/selectCompany/index.vue')
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/error/index.vue')
    },
    {
      path: '/:catchAll(.*)',
      component: () => import('@/views/error/index.vue')
    }
  ]
})

export default router
