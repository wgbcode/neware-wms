import request from '@/utils/request'

// 获取服务单详情
export function getServiceDetails(params: AnyObject<string | number>) {
  return request({
    url: `/serve/ServiceOrder/GetDetails`,
    method: 'get',
    params
  })
}

// 获取报价单详情
export function getQuotationDetails(params: AnyObject<string | number>) {
  return request({
    url: `/Material/Quotation/GetQuotationDetails`,
    method: 'get',
    params
  })
}

// 获取服务单操作记录
export function getQueryHistory(params: AnyObject) {
  return request({
    url: '/serve/ServiceOrder/QueryHistories',
    method: 'GET',
    params
  })
}

// 收集信息查询
export function getServiceOrderQuestions(params: AnyObject) {
  return request({
    url: '/serve/ServiceOrder/GetServiceOrderQuestions',
    method: 'GET',
    params
  })
}

// 获取客户详情信息
export function getCardInfoForServe(params: AnyObject) {
  return request({
    url: `/Sap/BusinessPartner/GetCardInfoForServe`,
    method: 'GET',
    params
  })
}
