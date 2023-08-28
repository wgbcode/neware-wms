import App from '@/App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

// 解决 pinia 未初始化问题
createApp(App).use(createPinia())

export const authStore = defineStore('auth', () => {
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const navRoutes = ref<RouteRecordRaw[]>([])

  const setToken = (newToken: string) => (token.value = newToken)
  const removeToken = () => (token.value = '')

  const setRefreshToken = (newRefreshToken: string) => (refreshToken.value = newRefreshToken)
  const removeRefreshToken = () => (refreshToken.value = '')

  const setNavRoutes = (newNavRoutes: RouteRecordRaw[]) => (navRoutes.value = newNavRoutes)

  return {
    token,
    refreshToken,
    setToken,
    removeToken,
    setRefreshToken,
    removeRefreshToken,
    setNavRoutes
  }
})()
