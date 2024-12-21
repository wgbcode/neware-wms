import request from '@/utils/request'

// 登录
export function Login(data: AnyObject<string>) {
  return request({
    url: '/check/login',
    method: 'post',
    data,
    isCancelRepeatRequest: true // 不允许重复请求
  })
}

// 退出
export function Logout(data: AnyObject<string>) {
  return request({
    url: '/check/login',
    method: 'post',
    data,
    isCancelRepeatRequest: true // 不允许重复请求
  })
}

// 获取动态路由
export function GetModulesTree(params: AnyObject<string>) {
  return request({
    url: '/Check/GetModulesTree',
    method: 'get',
    params
  })
}

// 获取二维码
export function GetLoginQRCode() {
  return request({
    url: '/QrCode/GetV2',
    method: 'get'
  })
}

// 校验用户扫码登录情况
export function ValidateLogin(params: AnyObject<string>) {
  return request({
    url: 'QrCode/ValidateLoginStateV2',
    method: 'get',
    params
  })
}

// 刷新已过期 token
export function RefreshToken(params: string) {
  return request({
    url: '/RefreshToken',
    method: 'get',
    params
  })
}

// 获取用户的所有信息
export function GetUserAll() {
  return request({
    url: '/Users/GetUserAll',
    method: 'get'
  })
}

// 获取所有用户的基本信息
export function GetAllUserInfo() {
  return request({
    url: '/Users/GetEmployInfo',
    method: 'get'
  })
}

// 登录后选择标识/公司
export function GetIndeiCateList(params:AnyObject) {
  return request({
    url: '/check/loginindicatelist',
    method: 'get',
    params
  })
}

// 标识/公司选择后提交
export function SubmitIndicate(params: AnyObject<string>) {
  return request({
    url: '/check/getindicate',
    method: 'get',
    params
  })
}
