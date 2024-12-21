// 二维码对象
export interface QrcodeData {
  scene: string
  meetingType: string
  orderId: string
}
// 钉钉树型节点数据对象
export interface DingTalkTreeNode {
  departments: AnyObject[]
  employs: AnyObject[]
  orgName: string
  label?: string
  children?: AnyObject[]
  type?: string
  key?: string
}
// 用户数据对象
export interface UserData {
  ddUserId: string
  employName: string
  id?: string
  key?: string
  label?: string
  orgName?: string[]
  type?: string
  value?: string
}
// 培训表单对象
export interface TrainFormData {
  info: string
  details: string
  type: string
  disabled: boolean
  selectList: AnyObject[]
  prop?: string
}
