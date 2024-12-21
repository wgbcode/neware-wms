import type { ShallowRef } from 'vue'

// leftCard
export type RowData = {
  amountStatus: string
  certNo: string
  dealDate: string
  inAccountAmount: number
  inAmount: number
  inOutAccountName: string
  indicator: string
  notInAccountAmount: number
  outAmount: number
  summary: string
  waterNo: string
  waterId: number
  ledgerAccount: string
  indicatorName: string
  currency: string
  rate: number
}

// rightCard
export type CardCodeList = {
  balance: number
  cardCode: string
  cardName: string
  value: string
  label: string
  checked?: boolean
}

export type AcctList = {
  acctCode?: string
  acctName?: string
  currency?: string
  canChangeCurr?: boolean // 选择科目账款并带出币种后是否还能继续选择币种，为 true 时可以
  rate?: number | null // 为 null 时需要提示财务根据过账日期重新维护汇率
  value: string
  label: string
  checked?: boolean
  indicator: string
}

export type PayMoneyLinkRow = {
  id: number // 行唯一标识
  actualPay: number
  amount: number
  applicant: null
  currency: string
  cutPayment: number
  docType: number
  docTypeName: string
  indicator: string
  indicatorName: string
  paymentNumber: number
  receiveAccountName: string
  status: number
  statusName: string
  ledgerAccount: string
  docDate: string
  checked: boolean // 为 true 时自动选中
  journalDetailResps: JournalsDetailRow[] // 日记账明细数据
}

export type AcceptMoneyChildLinkOrderRow = {
  id: number // 行唯一标识
  checked: boolean // 为 true 时自动选中
  currency: string
  inAccountAmount: number
  invoiceBalance: number
  invoiceNo: number
  invoiceTotalAmount: number
  rate: null | number
}

export type AcceptMoneyLinkOrderRow = {
  id: number // 行唯一标识
  checked: boolean // 为 true 时自动选中
  fullWidthRowData: AcceptMoneyChildLinkOrderRow[] // 跨网格行组件数据(前端自定义)
  invoices: AcceptMoneyChildLinkOrderRow[] // 跨网格行组件数据（后端回传）
  alreadyExpandFullWidthRow?: boolean // 下一行的跨网格行组件是否已经展开
  isFullWidthRow?: boolean // 当前行是否是跨网格行组件
  cardCode: string
  cardName: string
  createDate: string
  currency: string
  detailDocTypeName: string
  docEntry: number
  docTotal: number
  docType: number
  dueAmount: number
  inAccountAmount: number
  payee: string
  receiptAmount: number
  salesMan: string
  journalDetailResps: JournalsDetailRow[] // 日记账明细数据
  slpCode: number
}

export type BaseInfoRow = {
  id: number // 行唯一标识
  index?: number
  accountCode?: string
  currency: string
  rate: number
  payAmount?: number
  payAmountRMB?: number
  indicator?: string
  docDate?: string
  memo?: string
  cardCode?: string
  cardName?: string
  slpCode?: string
  slpName?: string
}

export type JournalsDetailRow = {
  id: number // 行唯一标识
  index?: number
  docEntry: number
  code: string
  name: string
  debitAmt: number
  creditAmt: number
  debitAmtTotal?: number
  creditAmtTotal?: number
  remark: string
  checked: boolean // 为 true 时自动选中
  currency: string
  docType: number // 单据类型
  addByLinkOrder?: boolean // 判断是否是通过 LinkOrder 模块关联添加的
  addType: 'addByLinkOrder' | 'addByUser' // 两种添加逻辑。勾选关联单据时自动添加 | 用户手动添加
}

export type RightCardHookParams = {
  emit: (...args: any[]) => void
  onSearch: () => void
  linkOrderTableData: ShallowRef<(PayMoneyLinkRow | AcceptMoneyLinkOrderRow)[]>
  baseInfoTableData: ShallowRef<BaseInfoRow[]>
  journalsDetailTableData: ShallowRef<JournalsDetailRow[]>
  linkOrderAgTable: Readonly<ShallowRef<AgGridInstance<AcceptMoneyLinkOrderRow> | AgGridInstance<PayMoneyLinkRow> | null>>
  baseInfoAgTable: Readonly<ShallowRef<AgGridInstance<BaseInfoRow> | null>>
  journalsDetailAgTable: Readonly<ShallowRef<AgGridInstance<JournalsDetailRow> | null>>
}

export type SaleManCompQuerySearch = {
  value?: string
  slpCode: number
  slpName: string
}
