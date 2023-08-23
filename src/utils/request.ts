import qs from 'qs'
import axios, { CanceledError, type AxiosRequestConfig } from 'axios'
import { authStore } from '@/stores/auth'

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
const getAbortKey = (config: AxiosRequestConfig) => {
  return (config.method || '') + config.url + '?' + qs.stringify(config.data || config.params)
}
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
request.interceptors.response.use(
  (response) => {
    // console.log('response', response)

    // 删除 abortKey
    const config = response.config
    config.isCancelRepeatRequest ? abortMap.delete(getAbortKey(config)) : ''

    // toDo：错误提示（res.code !== 200)

    return Promise.resolve(response.data)
  },
  (error) => {
    // console.log(error)

    // 删除 abortKey
    const { config, message } = error.config
    const isCanceledError = error instanceof CanceledError && message !== 'canceled' ? true : false
    isCanceledError ? '' : abortMap.delete(getAbortKey(config))

    return Promise.reject(error)
  }
)

export default request
