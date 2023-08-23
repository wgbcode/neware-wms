import router from '@/router'
import { authStore } from '@/stores/auth'
import { setToken, getToken } from '@/utils/auth'
import { getUserInfo } from '@/api/auth'

let noAddRoutes = true

// 配置全局前置守卫
router.beforeEach(async (to) => {
  //   console.log('to:', to, 'from:', from)

  // 路径中有 token 时，保存 token
  const queryToken = to.query['x-token'] as string
  if (queryToken) {
    setToken(queryToken)
    authStore.setToken(queryToken)
  }

  // token 存在
  const token = await getToken()
  if (token) {
    // 动态路由加载(模拟)
    getUserInfo(token).then((res) => {
      if (res.code === 1 && noAddRoutes) {
        noAddRoutes = false
        const willAddRoute = res.data
        router.addRoute(willAddRoute)
        router.push({ ...to, replace: true })
      }
    })
  }

  // 重定向到登录页面，且避免无限重定向
  if (!token && to.name !== 'login') {
    return { name: 'login' }
  }
})

// 配置全局后置守卫
// router.afterEach((to, from) => {
//   console.log(to, from)
// })
