import request from '@/utils/request'

// 获取销售应收页面表格数据(非树型数据)
type GetSalesOrderDueListParams = {
  indicator: string
  deptIndi: string
  orderAmt: string
  invoiceBal: string
  isMiddleman: string
  canInterRecon: string
  invoiceBalPcnt: string[]
  fromDataBase: string[]
  lastDeliveryDays: string[]
  orderFrom: string[]
  isShowAll: boolean
  isOnlyShowNoneReplace: boolean
  createDate_Start: string
  createDate_End: string
  page: number
  limit: number
  sortName: string
  sortOrder: 'desc' | 'asc'
}
export function GetSalesOrderDueList(data: Partial<GetSalesOrderDueListParams>) {
  return request({
    url: '/Finance/SalesInvoice/GetSalesOrderDueList',
    method: 'POST',
    data
  })
}

// 获取销售应收页面表格数据(树型数据)
export function GetSalesOrderGroupBySaleMen(data: Partial<GetSalesOrderDueListParams>) {
  return request({
    url: '/Finance/SalesInvoice/GetSalesOrderGroupBySaleMen',
    method: 'POST',
    data
  })
}

// 获取部门小红点数值
export function GetOrderOrgTypeCount() {
  return request({
    url: '/Finance/SalesInvoice/GetOrderOrgTypeCount',
    method: 'GET'
  })
}

// 添加备注
type AddSaleOrdrRemarkParams = {
  canInterRecon: number
  remark: string
  docEntrys: { docEntry: number; sboId: number }[]
}
export function AddSaleOrdrRemark(data: AddSaleOrdrRemarkParams) {
  return request({
    url: '/Finance/SalesInvoice/AddSaleOrdrRemark',
    method: 'POST',
    data
  })
}

// 获取备注
type GetSaleOrdrRemarksParams = { docEntry: number; sboId: number }
export function GetSaleOrdrRemarks(params: GetSaleOrdrRemarksParams) {
  return request({
    url: '/Finance/SalesInvoice/GetSaleOrdrRemarks',
    method: 'GET',
    params
  })
}
