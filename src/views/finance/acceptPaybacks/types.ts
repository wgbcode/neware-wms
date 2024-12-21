export type RowData = {
  account: null | number
  cardCode: string
  cardName: string
  creditAmount: number
  docEntry: number
  indicator: string
  indicatorName: string
  orderAmount: number
  receiptAmount: number
  remarks: null | string
  saleDocEntry: number
  saleMan: string
  updateTime: string
  receiptDocEntrys: ReceiptDocEntrys[] | null
  refundDocEntrys: RefundDocEntrys[] | null
  receiptDocEntryStrArr: string[]
  accepted: 'Y' | 'N' // 销售订单是否已验收
} & {
  [key: string]: any // 索引签名，允许动态添加属性
}

export type ReceiptDocEntrys = {
  printed: string // 是否已打印
  receiptAmount: number // 收款金额
  receiptDocCur: string // 收款币种
  receiptDocEntry: number // 收款 id
  receiptDocRate: number // 收款利率
}

export type RefundDocEntrys = {
  receiptDocCur: string // 退款币种
  globelApprovalId: number // 审批序号
  applyAmount: number // 退款金额
  status: number // 审批状态。0-审批中；1-已通过；2-驳回；3-撤回
}

interface ProcessBarDataInfo {
  auditTime: string
  departmentName: string
  intervalTime: number
  nodeName: string
  operationRecord: string
  operatorId: string
  operatorName: string
  operatorTime: string
  status: number
}
export type ProcessBarData = {
  auditTime: string
  info: ProcessBarDataInfo[]
  intervalTime: number
  isActivity: boolean
  nodeCode: string
  nodeName: string
  nodeType: string
  operatorTime: string
  remark: string
  status: number
  subNodes: AnyObject[]
}
