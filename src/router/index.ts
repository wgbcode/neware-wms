import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/views/layout/index.vue'
import Test from '@/views/test/index.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login/index.vue')
    },
    {
      path: '/404',
      component: () => import('@/views/error/index.vue')
    },
    {
      path: '/',
      component: Layout,
      name: 'layout'
    },
    {
      path: '/test',
      component: Test,
      name: 'test'
    },
    {
      path: '/:catchAll(.*)',
      component: () => import('@/views/error/index.vue')
    }
  ]
})

export default router
