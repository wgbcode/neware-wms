// 静态路由配置
export const staticRouter = [
  // 用于 BI 系统打开该系统的任意详情页
  {
    path: '/commonDetail',
    name: 'commonDetail',
    meta: { title: '公共详情页' },
    component: () => import('@/views/commonDetail/index.vue')
  },
  {
    path: '/reconciliationLog',
    name: 'reconciliationLog ',
    meta: { title: '对账日志' },
    component: () => import('@/views/reconciliationLog/index.vue')
  }
]
