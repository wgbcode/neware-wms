import axios from 'axios'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 创建实例
const request = axios.create({
  baseURL: 'https://www.fastmock.site/mock/e68d869253f9e376375eb399ba932142/newarewms',
  timeout: 500000000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    console.log('config', config)

    // 请求中断功能

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
    return response.data
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

export default request
