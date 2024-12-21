import request from '@/utils/request'

// 获取角色表格数据
export function GetRolesTableData(params?: AnyObject<string | number>) {
  return request({
    url: '/roles/load',
    method: 'get',
    params
  })
}

// 根据角色获取用户列表
export function LoadByRole(params: AnyObject<string | number>) {
  return request({
    url: '/users/loadByRole',
    method: 'get',
    params
  })
}

// 根据标识获取字典
export function GetCategoryNameList(params: AnyObject<string>) {
  return request({
    url: '/Categorys/GetCategoryNameList',
    method: 'get',
    params
  })
}

// 新增角色
export function AddRole(data: AnyObject<string | number>) {
  return request({
    url: '/roles/add',
    method: 'post',
    data
  })
}

// 修改角色
export function UpdateRole(data: AnyObject<string | number>) {
  return request({
    url: '/roles/update',
    method: 'post',
    data
  })
}

// 删除角色
export function DeleteRole(data: string[]) {
  return request({
    url: '/roles/delete',
    method: 'post',
    data
  })
}

// 获取当前角色已被分配的权限菜单数据
export function Loadforrole(params: AnyObject<string>) {
  return request({
    url: '/modules/loadforrole',
    method: 'get',
    params
  })
}

// 获取当前用户拥有的角色
export function Loadforuser(params: AnyObject<string>) {
  return request({
    url: '/roles/loadforuser',
    method: 'get',
    params
  })
}

// 获取当前角色已被分配的权限按钮数据
export function Loadmenusforrole(params: AnyObject<string>) {
  return request({
    url: '/modules/loadmenusforrole',
    method: 'get',
    params
  })
}

// 将角色已分配的权限全部取消（菜单权限、按钮权限、数据权限）
export function UnassignPemForRole(data: AnyObject) {
  return request({
    url: '/accessobjs/unassign',
    method: 'post',
    data
  })
}

// 为角色重新分配权限（菜单权限、按钮权限、数据权限）
export function AssignPemForRole(data: AnyObject) {
  return request({
    url: '/accessobjs/assign',
    method: 'post',
    data
  })
}
