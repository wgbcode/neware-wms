export type UserData = {
  account: string
  cardNo: null | string
  createTime: string
  createUser: string
  ddUserId: string
  ddUserName: string
  entryTime: string
  id: string
  indicateCodes: string | string[]
  indicateNames: string
  name: string
  organizationIds: string | string[]
  organizations: string
  serviceRelations: string
  sex: number
  status: number
  type: number
  nsapUserId?: number
  relatedPersonnel?: string
  password?: string
  description?: string
}

export type RoleRow = {
  createId: string
  createTime: string
  id: string
  identity: null | number
  name: string
  roleKey: string
  status: number
  typeId: string
  typeName: string
}
