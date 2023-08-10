import { createRouter, createWebHashHistory } from 'vue-router'
// import Layout from '@/views/layout/index.vue'
import Test from '@/views/test/index.vue'
import Login from '@/views/login/index.vue'

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
      component: Login,
      name: 'login'
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
