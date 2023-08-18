import { setToken, getToken } from '@/utils/auth'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

// 解决 pinia 未初始化问题
const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
const authStore = useAuthStore()

// 配置全局前置守卫
router.beforeEach((to, from) => {
  console.log('to', to)
  console.log('from', from)

  // 路径中有 token 时，保存 token
  const queryToken = to.query['x-token'] as string
  if (queryToken) {
    setToken(queryToken)
    authStore.setToken(queryToken)
  }

  // token 存在
  if (getToken()) {
    // toDo：动态路由加载
  }

  // 重定向到登录页面，且避免无限重定向
  if (!getToken() && to.name !== 'login') {
    return { name: 'login' }
  }
})

// 配置全局后置守卫
router.afterEach((to, from) => {
  console.log(to, from)
})
