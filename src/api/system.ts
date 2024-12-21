import { getToken } from '@/utils/auth'
import request from '@/utils/request'

// 获取所有菜单数据
export function GetModules() {
  return request({
    url: '/check/getmodules',
    method: 'get',
    params: { token: getToken() }
  })
}

// 获取所有权限按钮数据
export function Loadmenus() {
  return request({
    url: '/modules/loadmenus',
    method: 'get'
  })
}

// 获取所有部门列表数据
export function GetSubOrgs() {
  return request({
    url: '/check/getSubOrgs',
    method: 'get'
  })
}
