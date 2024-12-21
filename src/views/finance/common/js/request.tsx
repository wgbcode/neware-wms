import request from '@/utils/request'

// 添加备注
export function AddSaleOrdrRemark(data: AnyObject) {
  return request({
    url: '/Finance/SalesInvoice/AddSaleOrdrRemark',
    method: 'POST',
    data
  })
}

// 获取备注
export function GetSaleOrdrRemarks(params: AnyObject) {
  return request({
    url: '/Finance/SalesInvoice/GetSaleOrdrRemarks',
    method: 'GET',
    params
  })
}

// 获取对账单附件数据
export function GetClientReconciliationFiles(params: AnyObject) {
  return request({
    url: '/Finance/SalesInvoice/GetClientReconciliationFiles',
    method: 'GET',
    params
  })
}
