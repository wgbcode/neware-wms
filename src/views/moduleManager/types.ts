export type ModuleForm = {
  id: string
  name: string
  sortNo: number
  isSys: boolean
  code: string
  iconName: string
  url: string
  parentName: string
  cascadeId: string
  parentId: string | null
  status: number
}

export type BtnForm = {
  id: string
  name: string
  sort: number
  code: string
  domId: string
  cascadeId: string
  moduleId: string | null
  status: number
}
