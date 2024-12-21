// 打开服务单详情的必备参数
export interface openDetailParam {
  serviceId: string | number // 服务单id
  sapId: string | number // 服务单sapid
  pageType: string // 服务单打开方式
  flowId?: string // 服务单流程id
}
// 流程实例返回结果
export interface flowInstanceResult {
  operationHistory: AnyObject[] // 操作记录
  currentNode: currentNodeStructure // 当前节点
}
// 信息收集基础信息
export interface collectionBaseInfo {
  param: string
  options?: { label: string; value: string }[]
  value?: string
  description?: string
  questionType?: string
}
// 节点
export interface currentNodeStructure {
  activityName: string // 节点名称
  number: number // 节点序号
}
// 流程图节点实例
export interface flowPathItem {
  activityName: string // 节点名
  createTime: string // 创建时间
  intervalTime: number // 审批时长
  number: number // 序号
  isNode?: boolean
  userName?: string | undefined // 用户
  userDept?: string | undefined // 部门
  isFinished?: boolean // 已完成节点
  isApproved?: boolean // 是否手动审批过（非自动审批）
  isAutoHiden?: boolean // 是否跳过隐藏
  isCurrent?: boolean // 当前节点
}
// 报价单发票信息
export interface quotationInvoice {
  deliveryDate?: string
  deliveryMethod?: string
  invoiceCategory?: string
  invoiceCompany?: string
  moneyMeans?: string
  taxRate?: string
  serviceWorkOrders?: AnyObject[]
  isDisabled?: boolean
  shippingAddress?: string
}
