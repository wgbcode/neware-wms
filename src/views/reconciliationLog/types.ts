export type RowData = {
  isChecked?: boolean
  reconciliationSerialNum: string
  reconAmount: number
  reconCurrency: string | null
  bankFlows: bankFlows[]
  reconDetails: reconDetails[]
  journal_id: number
}
export type bankFlows = {
  waterId: number
  inOutAmount: number
  indicator: string
  remark: string | null
}
export type reconDetails = {
  journal_id?: number
  associatedDoc?: string | null
  documentAmount: number | null
  journalDetails: journalDetails[]
  remark: string
}
export type journalDetails = {
  code: string
  name: string
  creditAmount: number
  debitAmount: number
}
