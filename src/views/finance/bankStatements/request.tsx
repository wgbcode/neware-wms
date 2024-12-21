import request from '@/utils/request'
import type { JournalsDetailRow, BaseInfoRow, PayMoneyLinkRow, AcceptMoneyLinkOrderRow } from './types'

// 获取表格数据
type BankWaterLoadParams = {
  indicator: string
  incomeStatus: number
  waterDirection: string
  inOrOutAmount: number
  inOutAccountName: string
  summary: string
  page: number
  limit: number
}
export function BankWaterLoad(params: Partial<BankWaterLoadParams>) {
  return request({
    url: '/Finance/BankWater/Load',
    method: 'get',
    params
  })
}

// 获取状态下拉列表
export function GetDropDownOptions() {
  return request({
    url: '/Finance/BankWater/GetDropDownOptions',
    method: 'get'
  })
}

// 获取收款模块详情表格数据
type GetUnPaySaleOrdersParams = {
  receiptAmount: number | string
  cardName: string
  ledgerAccountCode: string
  docDate: string
  indicator: string
}
export function GetUnPaySaleOrders(data: Partial<GetUnPaySaleOrdersParams>) {
  return request({
    url: '/Finance/Receipt/GetUnPaySaleOrders',
    method: 'post',
    data
  })
}

// 获取业务伙伴下拉列表
export function GetCardCodeList(params?: { cardcode: string }): CustomResponse {
  return request({
    url: '/Finance/Receipt/GetCardCodeList',
    method: 'get',
    params
  })
}

// 获取总账科目列表（收款|付款）
export function GetAcctList(params: { docDate: string }) {
  return request({
    url: '/Finance/Receipt/GetAcctList',
    method: 'get',
    params
  })
}

// 获取总账科目列表（日记账）
export function GetJournalAcctList() {
  return request({
    url: '/Finance/Journal/GetAcctList',
    method: 'get'
  })
}

// 获取客户货币
export function GetCrminfo() {
  return request({
    url: '/Order/OrderDraft/crminfo',
    method: 'GET'
  })
}

// 判断币种汇率是否需要维护，返回 null 时表示需要维护
export function IsExitValidRate(params: { currency: string; rateDate?: string }) {
  return request({
    url: '/Order/OrderDraft/currency',
    method: 'GET',
    params
  })
}

// 收款模块提交接口
export function Reconcliation(data: AnyObject) {
  return request({
    url: '/Finance/BankWater/Reconcliation',
    method: 'post',
    data
  })
}

// 获取单据类型下拉列表
export function GetJournalDocType() {
  return request({
    url: '/Finance/Journal/GetJournalDocType',
    method: 'get'
  })
}

// 查询收款模块关联单据表格数据
type GetRelatedDocsParams = {
  id: number[] // 流水号(只能单选)
  docType?: number // 单据来源
  docEntry?: number // 审批序号
  receiptAccount?: string // 付款方名称
  receiptAmount?: number // 付款方金额
}
type GetRelatedDocsData = {
  baseInfo: BaseInfoRow // 基本信息
  receiptRelatedDocResps: AcceptMoneyLinkOrderRow[] // 关联单据 + 日记账明细
}
export function GetRelatedDocs(data: GetRelatedDocsParams) {
  return request<CustomResponse<GetRelatedDocsData>>({
    url: '/Finance/Receipt/GetRelatedDocs',
    method: 'post',
    data
  })
}

// 查询付款模块表格数据
type GetPaymentInfoParams = {
  id: number[] // 流水号（单选或多选）
  docType?: number // 单据来源
  paymentNumber?: number // 审批序号
  receiveAccountName?: string // 收款方名称
}
type GetPaymentInfoData = {
  baseInfo: BaseInfoRow // 基本信息
  paymentSummaryDtos: PayMoneyLinkRow[] // 关联单据 + 日记账明细
}
export function GetPaymentInfo(data: GetPaymentInfoParams) {
  return request<CustomResponse<GetPaymentInfoData>>({
    url: '/ExpenseAccount/GetPaymentInfo',
    method: 'post',
    data
  })
}

// 付款提交接口
export type OutPaymentAddReconcliationParams = {
  waterIds: number[]
  baseInfo: Partial<BaseInfoRow>
  linkOrders: Partial<PayMoneyLinkRow>[]
  journalDetails: Partial<JournalsDetailRow>[]
}
export function OutPaymentAddReconcliation(data: OutPaymentAddReconcliationParams) {
  return request({
    url: '/Finance/BankWater/OutPaymentAddReconcliation',
    method: 'post',
    data
  })
}

// 收款提交接口
export type ReceiptReconcliationParams = {
  waterIds: number[]
  baseInfo: Partial<BaseInfoRow>
  linkOrders: Partial<PayMoneyLinkRow>[]
  journalDetails: Partial<JournalsDetailRow>[]
}
export function ReceiptReconcliation(data: ReceiptReconcliationParams) {
  return request({
    url: '/Finance/BankWater/ReceiptReconcliation',
    method: 'post',
    data
  })
}

// 收款基本信息销售代表查询接口
export function GetSlpInfo(params: { keyword: string }) {
  return request({
    url: '/Finance/Receipt/GetSlpInfo',
    method: 'get',
    params
  })
}
