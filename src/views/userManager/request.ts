import request from '@/utils/request'

// 获取人员下拉列表
export function LoadUsers(params: AnyObject) {
  return request({
    url: '/users/load',
    method: 'get',
    params
  })
}

// 添加或编辑用户
export function AddOrUpdateUser(data: AnyObject) {
  return request({
    url: '/users/addorupdate',
    method: 'post',
    data
  })
}

// 删除用户
export function DeleteUser(data: string[]) {
  return request({
    url: '/users/delete',
    method: 'post',
    data
  })
}

// 动态获取 ERP3.0 关联人员下拉列表
export function GetErp3User(params: AnyObject) {
  return request({
    url: '/Users/GetErp3User',
    method: 'get',
    params
  })
}

// 获取当前用户 ERP3.0关联人员
export function GetErp3UserSingle(params: Record<string, string>) {
  return request({
    url: '/Users/GetErp3UserSingle',
    method: 'get',
    params
  })
}

// 获取劳务关系下拉列表
export function GetCategoryNameList() {
  return request({
    url: '/Categorys/GetCategoryNameList',
    method: 'get',
    params: { ids: 'SYS_ServiceRelations' }
  })
}

// 获取标识下拉列表
export function GetCategoryDtCodeList() {
  return request({
    url: '/Categorys/GetCategoryDtCodeList',
    method: 'get',
    params: { ids: 'SYS_LoginCompanyEntity' }
  })
}

// 获取钉钉账号表格数据
export function GetNotBindUser(data: Record<string, string | number>) {
  return request({
    url: '/DingTalk/DingTalkSet/GetNotBindUser',
    method: 'post',
    data
  })
}

// 钉钉信息绑定
export function UpdateDDBindUser(data: AnyObject) {
  return request({
    url: '/DingTalk/DingTalkSet/UpdateBindUser',
    method: 'post',
    data
  })
}

// 钉钉信息解绑
export function GetDelBindUser(params: AnyObject) {
  return request({
    url: '/DingTalk/DingTalkSet/GetDelBindUser',
    method: 'get',
    params
  })
}

// 更新服务标识
export function UpdateReimaburseServicerRelation(data: AnyObject) {
  return request({
    url: '/serve/Reimburse/UpdateReimaburseServicerRelation',
    method: 'post',
    data
  })
}
