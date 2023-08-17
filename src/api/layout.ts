import request from '@/utils/request'

export function login(params: Record<string, string>) {
  return request({
    url: '/login',
    method: 'get',
    params
  })
}
