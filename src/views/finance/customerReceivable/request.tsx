import request from '@/utils/request'

// 获取主页面表格数据
type GetClientDueListParams = {
  isShowAllAccount: boolean
  indicator: string
  cardCodeOrName: string
  salesMan: string
  saleOrder: string
  page: number
  limit: number
  receivableAmountLowLimit: string
  receivableAmountHighLimit: string
  contractAmountLowLimit: string
  contractAmountHighLimit: string
  recieveAblePercntLowLimit: string
  recieveAblePercntHighLimit: string
  overDuePercentLowLimit: string
  overDuePercentHighLimit: string
  sortName: string
  sortOrder: 'desc' | 'asc'
}

export function GetClientDueList(data: Partial<GetClientDueListParams>) {
  return request({
    url: '/Finance/SalesInvoice/GetClientDueList',
    method: 'POST',
    data
  })
}

// 获取详情页表头数据
export function GetClientDueDetailHeader(params: { cardCode: string }) {
  return request({
    url: '/Finance/SalesInvoice/GetClientDueDetailHeader',
    method: 'GET',
    params
  })
}

// 获取详情页表格数据
type GetClientDueDetailListParams = {
  orderReceivePercentRange: Array<unknown>
  cardCode: string
  isShowAllOrder: boolean
  page: number
  limit: number
  sortName: string
  sortOrder: 'desc' | 'asc'
}
export function GetClientDueDetailList(data: Partial<GetClientDueDetailListParams>) {
  return request({
    url: '/Finance/SalesInvoice/GetClientDueDetailList',
    method: 'POST',
    data
  })
}

// 获取详情页表格子表数据
export function GetClientDueDetailWaterList(params: { saleOrder: number }) {
  return request({
    url: '/Finance/SalesInvoice/GetClientDueDetailWaterList',
    method: 'GET',
    params
  })
}
