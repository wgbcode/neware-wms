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
  const navRoutes = ref<RouteRecordRaw[]>([])

  // token action
  const setToken = (newToken: string) => (token.value = newToken)

  // navRoutes
  const setNavRoutes = (newNavRoutes: RouteRecordRaw[]) => (navRoutes.value = newNavRoutes)

  return {
    token,
    setToken,
    setNavRoutes
  }
})()
