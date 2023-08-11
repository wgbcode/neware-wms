import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '@/views/login/index.vue'
import Layout from '@/views/layout/index.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
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
      component: Layout,
      children: [
        {
          path: '/accountCenter',
          name: 'accountCenter',
          meta: { title: '账号中心', icon: 'account-center', hidden: false },
          children: [
            {
              path: '/accountCenter/accountInfo',
              name: 'accountInfo',
              meta: { title: '账号资料', icon: '', hidden: false },
              component: () => import('@/views/accountCenter/accountInfo/index.vue')
            },
            {
              path: '/accountCenter/modifyPassword',
              name: 'modifyPassword',
              meta: { title: '修改资料', icon: '', hidden: false },
              component: () => import('@/views/accountCenter/modifyPassword/index.vue')
            },
          ]
        },
        {
          path: '/orderManage',
          name: 'orderManage',
          meta: { title: '订单管理', icon: 'order-manage', hidden: false },
          children: [
            {
              path: '/orderManage/logisticsOrder',
              name: 'logisticsOrder',
              meta: { title: '采购订单', icon: '', hidden: false },
              component: () => import('@/views/orderManage/logisticsOrder/index.vue')
            },
            {
              path: '/orderManage/purchaseOrder',
              name: 'purchaseOrder',
              meta: { title: '报价单', icon: '', hidden: false },
              component: () => import('@/views/orderManage/purchaseOrder/index.vue')
            },
            {
              path: '/orderManage/quoteOrder',
              name: 'quoteOrder',
              meta: { title: '物流订单', icon: '', hidden: false },
              component: () => import('@/views/orderManage/quoteOrder/index.vue')
            }
          ]
        },
      ]
    },
    {
      path: '/:catchAll(.*)',
      name: 'other',
      component: () => import('@/views/error/index.vue')
    }
  ]
})

export default router
