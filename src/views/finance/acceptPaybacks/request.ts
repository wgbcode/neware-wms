import request from '@/utils/request'

// 获取表格数据
type ReceiptLoadParams = {
  refundStatus: number
  receiptDocEntry: string
  saleDocEntry: string
  cardNameOrCode: string
  page: number
  limit: number
}
export function ReceiptLoad(data: Partial<ReceiptLoadParams>) {
  return request({
    url: '/Finance/Receipt/Load',
    method: 'post',
    data
  })
}

// 获取状态下拉列表
export function GetDropDownOptions() {
  return request({
    url: '/Finance/Receipt/GetDropDownOptions',
    method: 'get'
  })
}

// 获取收款明细数据
export function GetRecepitsInfos(params: { docEntry: number }) {
  return request({
    url: '/Finance/Receipt/GetRecepitsInfos',
    method: 'get',
    params
  })
}

// 收款明细打印
type ExportReceiptPdfParams = {
  salesDocEntry: number
  docEntry: number
  cardCode: string
  cardName: string
  docDate: string
  docTime: number
  salesMan: string
  remarks: string
  accountCode: string
  docTotal: number
}
export function ExportReceiptPdf(data: Partial<ExportReceiptPdfParams>) {
  return request({
    url: '/Finance/Receipt/ExportReceiptPdf',
    method: 'post',
    data,
    responseType: 'blob'
  })
}

// 获取退款详情页数据(新增前)
export function GetSaleRefundPreview(params: { orderId: number }) {
  return request({
    url: '/Finance/SaleRefund/Preview',
    method: 'get',
    params
  })
}

// 获取退款详情页数据(新增后)
export function GetSaleRefundDetail(params: { globelApprovalId: number }) {
  return request({
    url: '/Finance/SaleRefund/GetSaleRefundDetail',
    method: 'get',
    params
  })
}

// 获取币种数据源
export function GetBase() {
  return request({
    url: '/Order/SaleQuotation/GetBase',
    method: 'get'
  })
}

// 发起退款
export type ApplySaleRefundParams = {
  indicator: string
  indicatorName: string
  cardCode: string
  refundPath: number
  receiveAccountName: string
  receiveAccount: string
  receiveBankName: string
  applyAmount: number
  reason: number
  returnDocEntry: number
  remark: string
  refundId: number | null // 退款 id。新增时回传 null，再次发起时回传确定值
}
export function ApplySaleRefund(data: ApplySaleRefundParams) {
  return request({
    url: '/Finance/SaleRefund/ApplySaleRefund',
    method: 'post',
    data
  })
}

// 撤回退款
export type SaleRefundReCallParams = {
  docEntry: number
}
export function SaleRefundReCall(data: SaleRefundReCallParams) {
  return request({
    url: '/Finance/SaleRefund/ReCall',
    method: 'post',
    data
  })
}

// 退款审批（同意或者拒绝）
export type SaleRefundApprovaParams = {
  docEntry: number // 退款 id
  opinion: string
  approvalType: number
}
export function SaleRefundApprova(data: SaleRefundApprovaParams) {
  return request({
    url: '/Finance/SaleRefund/Approval',
    method: 'post',
    data
  })
}

// 删除退款单据
export function SaleRefundDelete(data: { globelApprovalId: number }) {
  return request({
    url: '/Finance/SaleRefund/Delete',
    method: 'post',
    data
  })
}
