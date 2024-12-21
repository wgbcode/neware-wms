import type { ClientInfo } from '@/components/customerIcons/index.vue'
import type { StepPBInfoItem } from '@/components/stepPercentBar/index.vue'

export type RowData = {
  id: number
  billAmt: number
  billAmtPcnt: number
  cardCode: string
  cardName: string
  creditAmt: number
  deliveryAmt: number
  docEntry: number
  erp3UserId: number
  groupNum: number
  indicator: string
  invoiceBal: number
  invoiceBalPcnt: number
  lastDeliveryDate: null
  lastReceiptDate: null
  middleman: string
  orderAmt: number
  orderCreateDate: string
  orderUpdateDate: string
  overDueAmt: number
  overDueAmtPcnt: number
  pymntGroupName: string
  receiptAmt: number
  slpCode: number
  slpName: string
  stockValue: number
  userId: string
  hasRemark: boolean // 是否有备注
  canInterRecon: number // 是否可清单
  sboId: number // 账套 id
  hasClientReconciliation: boolean // 是否有对账单
  accepted: 'Y' | 'N' // 销售订单是否已验收
  dataFrom: 'neware_201304' | 'neware_200907' | 'neware_200409'
  userType: string
  saleOrderPaymentProgress: StepPBInfoItem[]
  clientInfo: ClientInfo
}
