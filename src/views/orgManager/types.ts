export type GorpList = {
  corpDesc: string
  corpName: string
  fax: string
  id: string
  oa: string
  officeAddr: string
  tel: string
  updDt: string
}

export type UpdateOrgParams = {
  cascadeId: string
  corpId: string
  id: null | string
  name: string
  parentId: string
  parentName: string
  status: number
  deptManager: string[]
}
