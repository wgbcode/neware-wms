import axios from 'axios'

// 创建实例
const request = axios.create({
  baseURL: 'https://www.fastmock.site/mock/e68d869253f9e376375eb399ba932142/newarewms',
  timeout: 500000000
})

// 请求拦截器
request.interceptors.request.use((config) => {
  console.log(config)

  return config
})

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log(response)
    return response.data
  },
  (error) => {
    console.log(error)
  }
)

export default request
