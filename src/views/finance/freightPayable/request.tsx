import request from '@/utils/request'

// 获取主页面表格数据
type GetFreightPayableInvoicesParams = {
  keyword: string
  cardSearch: string
  indicator: string
  checkStatus: boolean
  isPaid: boolean
  page: number
  limit: number
  sortName: string
  sortOrder: 'desc' | 'asc'
}
export function GetFreightPayableInvoices(data: Partial<GetFreightPayableInvoicesParams>) {
  return request({
    url: '/Finance/Freight/GetFreightPayableInvoices',
    method: 'POST',
    data
  })
}

// 对账提交
type IndexUpdateSetCheckMonthParams = { dtoStr: string }
export function IndexUpdateSetCheckMonth(data: IndexUpdateSetCheckMonthParams) {
  return request({
    url: '/Finance/Freight/IndexUpdateSetCheckMonth',
    method: 'POST',
    data
  })
}

// 发起付款验证，获取详情数据
type IndexCheckPaymentParams = { dtoStr: string }
export function IndexCheckPayment(data: IndexCheckPaymentParams) {
  return request({
    url: '/Finance/Freight/IndexCheckPayment',
    method: 'POST',
    data
  })
}

// 发起付款提交
export function IndexInsertPayment(data: FormData) {
  return request({
    url: '/Finance/Freight/IndexInsertPayment',
    method: 'POST',
    data
  })
}
