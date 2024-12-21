import type { ClientInfo } from '@/components/customerIcons/index.vue'
import type { ProgressBar } from '@/components/progressBar/index.vue'

export type RowData = {
  cardCode: string
  cardName: string
  checkMonth: string
  checkStatus: boolean
  createTime: string
  creator: string
  currencyCode: string
  deliverOrder: string
  docTotal: number
  invoiceOrder: string
  isPaid: boolean
  payPlanName: string
  saleIdentify: string
  salesMan: string
  sourceId: boolean
  sourceNumber: string
  sourceType: number
  transportDocOrder: string
  updateTime: string
  salesManType: string
  salesManId: string
  clientInfo: ClientInfo
  progressNodes: ProgressBar[]
}
