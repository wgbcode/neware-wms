export type RowData = {
  id: number
  balance: number
  billReceivableAmount: number
  billTotalAmount: number
  cardCode: string
  cardName: string
  comment: string
  contractTotalAmount: number
  deliveryTotalAmount: number
  finalOrderDate: string
  overDueAmount: number
  overDuePercent: number
  receivableInvoiceTotalAmount: number
  receivablePercent: number
  receiveTotalAmount: number
  returnTotalAmount: number
}

export type DetailRowData = {
  id: number
  actualSaleAmount: number
  billAmount: number
  billAmountPercent: number
  billReceiveAmount: number
  billReceivePercent: number
  canceled: string
  closeItemAmount: number
  comment: string
  contractAmount: number
  creditTotalAmount: number
  customerRefCode: string
  deliveryAmountPercent: number
  deliveryDocCur: string
  deliveryTotalAmount: number
  detailDtos: null
  hasReceiveInvoiceAmount: boolean
  indicator: string
  indicatorName: string
  isMainSalesManSort: number
  orderCreateTime: string
  orderDocCur: string
  orderReceiveInvoiceAmount: number
  orderReceivePercent: number
  orderStatus: number
  orderStatusName: string
  overDueAmount: string
  overDueDays: string
  overDuePercent: string
  paymentRule: string
  receiveAmount: number
  receiveMoneyPercent: number
  saleOrder: number
  salesMan: string
  salesManId: string
  slpCode: number
  updateTime: string
  userType: string
  canInterRecon: 0 | 1 | 2 // 不可清单 | 可清单 | 已清单
  hasRemark: boolean // 是否有评论
  hasClientReconciliation: boolean // 是否有对账单
  sboId: number // 账套 id
  accepted: 'Y' | 'N' // 销售订单是否已验收
}

export type DetailTitleData = {
  cardCode: string
  cardName: string
  actualSaleAmount: number
  billReceivableAmount: number
  billTotalAmount: number
  contractAmount: number
  creditTotalAmount: number
  deliveryAmount: number
  overDueAmount: number
  overDuePercent: string
  receivableInvoiceAmount: number
  receivablePercent: string
  receiveAmount: number
  reconciliationCount: number
}
