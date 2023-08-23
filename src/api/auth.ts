import request from '@/utils/request'
import type { RouteRecordRaw } from 'vue-router'

interface UserInfo {
  code: number
  data: RouteRecordRaw
}

// 登录
export function login(params: Record<string, string>) {
  return request({
    url: '/login',
    method: 'get',
    params,
    isCancelRepeatRequest: true // 不允许重复请求
  })
}

// 获取用户信息
export function getUserInfo(params: string): Promise<UserInfo> {
  console.log('token', params)

  const navRoutes = [
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
  const willAddRoute = {
    path: '/layout',
    name: 'layout',
    component: () => import('@/views/layout/index.vue'),
    children: navRoutes
  }

  return new Promise((resolve) => resolve({ code: 1, data: willAddRoute }))

  // return request({
  //   url: '/getUserInfo',
  //   method: 'get',
  //   params,
  //   isCancelRepeatRequest: true
  // })
}

// 获取二维码
export function getLoginQRCode() {
  return request({
    url: '/getLoginQRCode',
    method: 'get'
  })
}
