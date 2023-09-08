import request from '@/utils/request'
import type { RouteRecordRaw } from 'vue-router'

interface UserInfo {
  code: number
  data: RouteRecordRaw
}

// 登录
export function login(data: Record<string, string>) {
  return request({
    url: '/common/login',
    method: 'post',
    data,
    isCancelRepeatRequest: true // 不允许重复请求
  })
}

// 获取用户信息(如路由)
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
    },
    {
      path: '/test',
      name: 'test',
      meta: { title: '测试', icon: 'test', hidden: false },
      children: [
        {
          path: '/test/index',
          name: 'index',
          meta: { title: '测试', icon: '', hidden: false },
          component: () => import('@/views/test/index.vue')
        },
        {
          path: '/test/CommonSearch',
          name: 'commonSearch',
          meta: { title: '搜索栏', icon: '', hidden: false },
          component: () => import('@/views/test/CommonSearch.vue')
        },
        {
          path: '/test/CommonTable',
          name: 'commonTable',
          meta: { title: '表格', icon: '', hidden: false },
          component: () => import('@/views/test/CommonTable.vue')
        },
        {
          path: '/test/CommonPaginatin',
          name: 'commonPaginatin',
          meta: { title: '分页器', icon: '', hidden: false },
          component: () => import('@/views/test/CommonPaginatin.vue')
        },
        {
          path: '/test/CommonVirtualTable',
          name: 'CommonVirtualTable',
          meta: { title: '虚似化表格', icon: '', hidden: false },
          component: () => import('@/views/test/CommonVirtualTable.vue')
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

// 校验用户扫码登录情况
export function validateLogin(params: Record<string, string>) {
  return request({
    url: '/validateLogin',
    method: 'get',
    params
  })
}

// 刷新已过期 token
export function refreshToken(params: string) {
  return request({
    url: '/refreshToken',
    method: 'get',
    params
  })
}
