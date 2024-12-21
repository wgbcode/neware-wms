import request from '@/utils/request'

// 获取付款主页面表格数据
type PaymentLoadParams = {
  status: number
  indicator: string
  approvalNum: number
  sourceCode: string
  saleMan: string
  docType: string
  page: number
  limit: number
  sortName: string
  sortOrder: 'desc' | 'asc'
}
export function Load(params: Partial<PaymentLoadParams>) {
  return request({
    url: '/Payment/Load',
    method: 'get',
    params
  })
}

// 获取汇总列表弹窗数据
export function GetPaymentDataBeforeCommit(data: { paymentIds: number[] }) {
  return request({
    url: '/Payment/GetPaymentDataBeforeCommit',
    method: 'post',
    data
  })
}

// 获取预览列表弹窗数据
type PaymentBeforeCommitResps = {
  paymentNumber: string
  docTypeName: string
  docType: number
  receiveAccountName: string
  receiveAccount: string
  bankName: string
  currency: string
  applicant: string
  amount: number
  cutPayment: number
  actualPay: number
  usage: string
}
type PaymentIdAndGlobalIds = {
  paymentId: number
  globalId: number
}
type GetPaymentPreviewParams = {
  accountCode: string
  payWay: string
  getPaymentBeforeCommitResps: Array<PaymentBeforeCommitResps>
  paymentIdAndGlobalIds: Array<PaymentIdAndGlobalIds>
}
export function GetPaymentPreview(data: GetPaymentPreviewParams) {
  return request({
    url: '/Payment/Preview',
    method: 'post',
    data
  })
}

// 判断是否允许导出付款单（Excel）
type ExportPaymentParams = {
  accountCode: string
  batchNum: string
  getPaymentBeforeCommitResps: Array<PaymentBeforeCommitResps>
  paymentId2GlobalIds: Array<PaymentIdAndGlobalIds>
}
export function ExportPayment(data: ExportPaymentParams) {
  return request({
    url: '/Payment/ExportPayment',
    method: 'post',
    data
  })
}

// 提交付款单
type CommitPaymentParams = {
  payway: number
  accountCode: string
  batchNum: number
  getPaymentBeforeCommitResps: Array<PaymentBeforeCommitResps>
  paymentId2GlobalIds: Array<PaymentIdAndGlobalIds>
  template?: number
}
export function CommitPayment(data: CommitPaymentParams) {
  return request({
    url: '/Payment/CommitPayment',
    method: 'post',
    data
  })
}

// 解锁付款单
export function UnLockThePayment(data: number[]) {
  return request({
    url: '/Payment/UnLockThePayment',
    method: 'post',
    data
  })
}

// 打印付款单（PDF)
export function BatchPaymentPrint(data: { paymentIds: number[] }) {
  return request({
    url: '/Payment/BatchPaymentPrint',
    method: 'post',
    data,
    responseType: 'blob'
  })
}

// 驳回单据
export function PaymentReject(data: { paymentIds: number[] }) {
  return request({
    url: '/Payment/PaymentReject',
    method: 'post',
    data
  })
}
