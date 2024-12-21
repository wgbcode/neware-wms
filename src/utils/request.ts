import qs from 'qs'
import axios, { CanceledError, type AxiosRequestConfig } from 'axios'
import { authStore } from '@/stores/auth'
import { setToken } from './auth'
import { RefreshToken } from '@/api/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { getToken } from './auth'

declare module 'axios' {
  // 定义实例参数类型和返回值类型
  interface AxiosInstance {
    <T = Promise<any>>(_config: AxiosRequestConfig): T
  }

  // 自定义实例参数
  export interface AxiosRequestConfig {
    isCancelRepeatRequest?: boolean
  }
}

// 创建实例
const request = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 1000000000,
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
    // 添加请求中断功能
    config.isCancelRepeatRequest && setAbortMap(config)

    // 添加 token
    const token = authStore.token || getToken()
    token && (config.headers['X-Token'] = token)

    // get 请求时序列化 params（可能为数组形式）
    config.method === 'get' && (config.paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'repeat' }))

    // 添加 responseType
    config.responseType && (config.headers['responseType'] = config.responseType)

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
let isRefreshToken = false
let pendingRequests: Function[] = []
request.interceptors.response.use(
  (response) => {
    const { config, status, data } = response

    // 删除 abortKey
    config.isCancelRepeatRequest && abortMap.delete(getAbortKey(config))

    // 错误提示，回传的实体必须包含 code 和 message
    const { code, message } = data ?? {}
    const ignoreURLs = ['QrCode/ValidateLoginStateV2'] // 忽视的请求路径
    const isCheckPass = code && code !== 200 && message && !ignoreURLs.includes(config.url ?? '')
    if (isCheckPass) {
      // 判断是否是服务端错误(500-599)
      const type = /^5\d{2}$/.test(code.toString()) ? 'error' : 'warning'
      ElMessage({ type, message })
    }

    // TODO：需后端配合实现。刷新过期 token，并重新发起请求(token：2h；refreshToken：7天)
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
        RefreshToken(authStore.refreshToken)
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
    // 删除 abortKey
    const { message } = error.config
    const isCanceledError = error instanceof CanceledError && message !== 'canceled' ? true : false
    !isCanceledError && abortMap.delete(getAbortKey(error.config))
    ElMessage({ type: 'error', message: error })
    return Promise.reject(error)
  }
)

export default request
