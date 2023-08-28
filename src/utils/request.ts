import qs from 'qs'
import axios, { CanceledError, type AxiosRequestConfig } from 'axios'
import { authStore } from '@/stores/auth'
import { setToken } from './auth'
import { refreshToken } from '@/api/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

declare module 'axios' {
  // 定义实例参数类型和返回值类型
  interface AxiosInstance {
    // eslint-disable-next-line no-unused-vars
    (config: AxiosRequestConfig): Promise<any>
  }

  // 自定义实例参数
  export interface AxiosRequestConfig {
    isCancelRepeatRequest?: boolean
  }
}

// 创建实例
const request = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000,
  isCancelRepeatRequest: false
})

// 设置 abortController 和 Map
const abortMap = new Map()
const getAbortKey = (config: AxiosRequestConfig) => config.method + ':/' + config.url
const setAbortMap = (config: AxiosRequestConfig) => {
  const controller = new AbortController()
  config.signal = controller.signal
  const key = getAbortKey(config)
  abortMap.has(key) ? controller.abort() : abortMap.set(key, controller)
}

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // console.log('config', config)

    // 添加请求中断功能
    config.isCancelRepeatRequest ? setAbortMap(config) : ''

    // 添加 token
    authStore.token ? (config.headers['X-Token'] = authStore.token) : ''

    // get 请求时序列化 params（可能为数组形式）
    config.method === 'get'
      ? (config.paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'repeat' }))
      : ''

    return config
  },
  (error) => {
    // console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
let isRefreshToken = false
let pendingRequests: Function[] = []
request.interceptors.response.use(
  (response) => {
    // console.log('response', response)

    const { config, status } = response

    // 删除 abortKey
    config.isCancelRepeatRequest ? abortMap.delete(getAbortKey(config)) : ''

    // toDo：错误提示（status !== 200)

    // 刷新过期 token，并重新发起请求(token：2h；refreshToken：7天)
    if (status === 401) {
      const cacheRequest = (config: AxiosRequestConfig) =>
        new Promise((resolve) =>
          pendingRequests.push((token: string) => {
            config.headers!['X-Token'] = token
            resolve(request(config))
          })
        )
      if (!isRefreshToken) {
        isRefreshToken = true
        refreshToken(authStore.refreshToken)
          .then(async (res) => {
            const { code, token } = res
            if (code === 1) {
              setToken(token)
              authStore.setToken(token)
              await cacheRequest(config)
              pendingRequests.forEach((req) => req(token))
            } else {
              router.push({ path: '/login' })
              ElMessage.error('认证失败，请重新登录')
            }
          })
          .finally(() => {
            isRefreshToken = false
            pendingRequests = []
          })
      } else {
        // 刷新 token 期间，让所有请求处于 pending 状态
        return cacheRequest(config)
      }
    }

    return Promise.resolve(response.data)
  },
  (error) => {
    // console.log('error', error)

    // 删除 abortKey
    const { message } = error.config
    const isCanceledError = error instanceof CanceledError && message !== 'canceled' ? true : false
    isCanceledError ? '' : abortMap.delete(getAbortKey(error.config))

    return Promise.reject(error)
  }
)

export default request
