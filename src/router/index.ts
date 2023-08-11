import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/views/layout/index.vue'
import Test from '@/views/test/index.vue'
import Login from '@/views/login/index.vue'
import AccountInfo from '@/views/accountCenter/accountInfo/index.vue'
import ModifyPassword from '@/views/accountCenter/modifyPassword/index.vue'
import LogisticsOrder from '@/views/orderManage/logisticsOrder/index.vue'
import PurchaseOrder from '@/views/orderManage/purchaseOrder/index.vue'
import QuoteOrder from '@/views/orderManage/quoteOrder/index.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Login
    },
    {
      path: '/login',
      component: () => import('@/views/login/index.vue')
    },
    {
      path: '/404',
      component: () => import('@/views/error/index.vue')
    },
    {
      path: '/test',
      component: Test
    },
    {
      path: '/layout',
      component: Layout,
      children: [
        {
          path: '/accountCenter/accountInfo',
          component: AccountInfo
        },
        {
          path: '/accountCenter/modifyPassword',
          component: ModifyPassword
        },
        {
          path: '/orderManage/logisticsOrder',
          component: LogisticsOrder
        },
        {
          path: '/orderManage/purchaseOrder',
          component: PurchaseOrder
        },
        {
          path: '/orderManage/quoteOrder',
          component: QuoteOrder
        }
      ]
    },
    {
      path: '/:catchAll(.*)',
      component: () => import('@/views/error/index.vue')
    }
  ]
})

export default router
