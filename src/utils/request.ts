import axios, { CanceledError, type AxiosRequestConfig } from 'axios'
import { useUserStore } from '@/stores/user'
import qs from 'qs'

const userStore = useUserStore()

// 扩展自定义配置参数
declare module 'axios' {
  export interface AxiosRequestConfig {
    isCancelRepeatRequest?: boolean
  }
}

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

// 创建实例
const request = axios.create({
  baseURL: 'https://www.fastmock.site/mock/e68d869253f9e376375eb399ba932142/newarewms',
  timeout: 30000,
  isCancelRepeatRequest: false
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    console.log('config', config)

    // 请求中断功能
    config.isCancelRepeatRequest ? setAbortMap(config) : ''

    // 添加 token
    userStore.token ? (config.headers['X-Token'] = userStore.token) : ''

    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log('response', response)

    // 删除 abortKey
    const config = response.config
    config.isCancelRepeatRequest ? abortMap.delete(getAbortKey(config)) : ''

    // toDo：错误提示（res.code !== 200)

    return response.data
  },
  (error) => {
    console.log(error)

    // 删除 abortKey
    const { config, message } = error.config
    const isCanceledError = error instanceof CanceledError && message !== 'canceled' ? true : false
    isCanceledError ? '' : abortMap.delete(getAbortKey(config))

    return Promise.reject(error)
  }
)

export default request
