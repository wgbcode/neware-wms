import request from '@/utils/request'

// 新增菜单
export function AddModules(data: Record<string, unknown>) {
  return request({
    url: '/modules/add',
    method: 'post',
    data
  })
}

// 更新菜单
export function UpdateModules(data: Record<string, unknown>) {
  return request({
    url: '/modules/update',
    method: 'post',
    data
  })
}

// 删除菜单
export function DeleteModules(data: string[]) {
  return request({
    url: '/modules/delete',
    method: 'post',
    data
  })
}

// 查看菜单角色权限
export function LoadForRoleModule(params: Record<string, string>) {
  return request({
    url: '/modules/LoadForRoleModule',
    method: 'get',
    params
  })
}

// 新增权限按钮
export function AddBtn(data: Record<string, unknown>) {
  return request({
    url: '/modules/addmenu',
    method: 'post',
    data
  })
}

// 更新权限按钮
export function UpdateBtn(data: Record<string, unknown>) {
  return request({
    url: '/modules/updatemenu',
    method: 'post',
    data
  })
}

// 删除权限按钮
export function DeleteBtn(data: string[]) {
  return request({
    url: '/modules/deletemenu',
    method: 'post',
    data
  })
}
