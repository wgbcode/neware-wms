import type { ProgressBar } from '@/components/progressBar/index.vue'

interface RowDataDetail {
  outsourcId: number
  outsourcStatusName: string
  purchaseOrderId: number
  purchaseSourceNumber: number | null
  reimburseFromOrderId: number
  reimburseFromOrderType: number
  reimburseId: number
}

export type RowData = {
  id: number
  approvalNumber: string
  type: number
  typeName: string
  amount: number
  currency: string
  receiveAccountName: string
  receiveAccount: string
  bankName: string
  applicantName: string
  indicator: string
  updateTime: string
  status: number
  statusName: string
  progressBarNodeList: ProgressBar[]
  detail: RowDataDetail
}

export type SumRowData = {
  actualPay: number
  amount: number
  applicant: string
  bankName: string
  currency: string
  cutPayment: number | string
  docType: number
  docTypeName: string
  paymentNumber: string
  receiveAccount: string
  receiveAccountName: string
  usage: string
}
