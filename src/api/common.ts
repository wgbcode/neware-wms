import request from '@/utils/request'

// 标识列表
export function GetOidcinfo() {
  return request({
    url: '/Order/OrderDraft/oidcinfo',
    method: 'GET'
  })
}
