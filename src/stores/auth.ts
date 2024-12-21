import App from '@/App.vue'
import { createApp, computed } from 'vue'
import { createPinia } from 'pinia'
import { shallowRef } from 'vue'
import { defineStore } from 'pinia'

// 鉴权前先初始化 app 和 pinia
export const pinia = createPinia()
export const app = createApp(App).use(pinia)

export interface ModuleTree {
  item: AnyObject
  children: ModuleTree[]
}

export const authStore = defineStore('auth', () => {
  const token = shallowRef<string>('')
  const refreshToken = shallowRef<string>('')
  const modulesTree = shallowRef<ModuleTree[]>()
  const userInfo = shallowRef<AnyObject | null>(null)
  const allUserList = shallowRef<AnyObject[]>([])

  // actions
  const setToken = (value: string) => (token.value = value)
  const removeToken = () => (token.value = '')
  const setRefreshToken = (value: string) => (refreshToken.value = value)
  const removeRefreshToken = () => (refreshToken.value = '')
  const setModulesTree = (value: ModuleTree[]) => (modulesTree.value = value)
  const saveUserInfo = (value: AnyObject) => (userInfo.value = value)
  const setAllUserList = (value: AnyObject[]) => (allUserList.value = value)
  const removeUserInfo = () => (userInfo.value = null)

  // getter
  const getAllUserList = computed(() => {
    return allUserList.value
  })
  
  return {
    token,
    refreshToken,
    modulesTree,
    userInfo,
    allUserList,
    setToken,
    removeToken,
    setRefreshToken,
    removeRefreshToken,
    setModulesTree,
    saveUserInfo,
    setAllUserList,
    removeUserInfo,
    getAllUserList
  }
})()
