import request from '@/utils/request'

// 获取公司列表数据
export function GetCorp() {
  return request({
    url: '/Check/GetCorp',
    method: 'get'
  })
}

// 新增部门
export function AddOrg(data: AnyObject) {
  return request({
    url: '/orgs/add',
    method: 'post',
    data
  })
}

// 编辑部门
export function EditOrg(data: AnyObject) {
  return request({
    url: '/orgs/update',
    method: 'post',
    data
  })
}

// 删除部门
export function DeleteOrg(data: string[]) {
  return request({
    url: '/orgs/delete',
    method: 'post',
    data
  })
}

// 获取部门下的人员列表
export function LoadUsersByOrg(params: AnyObject) {
  return request({
    url: '/users/LoadByOrg',
    method: 'get',
    params
  })
}

// 为部门分配用户
export function AssignOrgUsers(data: AnyObject) {
  return request({
    url: '/AccessObjs/AssignOrgUsers',
    method: 'post',
    data
  })
}
