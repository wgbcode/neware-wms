import request from '@/utils/request'

// 获取退款表格数据
export function GetSaleRefundList(data: AnyObject) {
  return request({
    url: '/Finance/SaleRefund/GetSaleRefundList',
    method: 'POST',
    data
  })
}
