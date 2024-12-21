export type RowData = {
  id: string
  index: number
  name: string
  roleKey: string
  identity: string | null
  list?: string[] | null
}

export type RuleForm = {
  id?: string
  name: string
  identity: string
  roleKey: string
  status: number
  organizationIds?: ''
  organizations?: ''
}
