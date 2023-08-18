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
      children: [
        {
          path: '/accountCenter',
          name: 'accountCenter',
          meta: { title: '账号中心', icon: 'account-center', hidden: false },
          children: [
            {
              path: '/accountCenter/home',
              name: 'home',
              meta: { title: '主页', icon: '', hidden: false },
              component: () => import('@/views/accountCenter/Home.vue')
            },
            {
              path: '/accountCenter/accountInfo',
              name: 'accountInfo',
              meta: { title: '账号资料', icon: '', hidden: false },
              component: () => import('@/views/accountCenter/AccountInfo.vue')
            },
            {
              path: '/accountCenter/modifyPassword',
              name: 'modifyPassword',
              meta: { title: '修改资料', icon: '', hidden: false },
              component: () => import('@/views/accountCenter/ModifyPassword.vue')
            }
          ]
        },
        {
          path: '/orderManage',
          name: 'orderManage',
          meta: { title: '订单管理', icon: 'order-manage', hidden: false },
          children: [
            {
              path: '/orderManage/purchaseOrder',
              name: 'purchaseOrder',
              meta: { title: '采购订单', icon: '', hidden: false },
              component: () => import('@/views/orderManage/PurchaseOrder.vue')
            },
            {
              path: '/orderManage/quoteOrder',
              name: 'quoteOrder',
              meta: { title: '报价单', icon: '', hidden: false },
              component: () => import('@/views/orderManage/QuoteOrder.vue')
            },
            {
              path: '/orderManage/logisticsOrder',
              name: 'logisticsOrder',
              meta: { title: '物流订单', icon: '', hidden: false },
              component: () => import('@/views/orderManage/LogisticsOrder.vue')
            }
          ]
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
