// 本模块操作服务单流程实例、流程节点与操作记录

import { ref, shallowRef } from 'vue'
import * as serviceApi from '../request'
import type { flowInstanceResult, currentNodeStructure, flowPathItem } from '../serviceDetailTypes'
import { cloneDeep } from 'lodash-es'

// 全部报价单节点
export const allNodeLists = [
  '建立服务单',
  '业务员审批',
  '售后工程部报价',
  '技术员抢单',
  '总经理审批',
  '开始出库',
  '出库',
  '出库完成',
  '技术员处理中',
  '申请退料',
  '储运收货',
  '品质检验',
  '仓库入库',
  '技术员完成',
  '品质验收',
  '服务单回访',
  '结束'
]
const hidenNodeLists = ['开始出库', '出库完成', '申请退料', '储运收货', '品质检验', '仓库入库'] // 隐藏跳过的节点

export default async function (flowInstanceId: string = '') {
  const allTimeList = ref<flowPathItem[]>([]) // 服务单进度条
  const operationHistory = ref<AnyObject[]>([]) // 操作记录
  const currentNode = shallowRef<currentNodeStructure>({ activityName: '', number: 0 }) // 当前节点
  const flowpreviousid = shallowRef<string>('') // 前一个节点

  if (flowInstanceId) {
    const flowRes: flowInstanceResult = await setServiceFlow(flowInstanceId)!
    operationHistory.value = flowRes.operationHistory.reverse() // 逆序
    currentNode.value = flowRes.currentNode
  }

  // 获取服务单流程
  async function setServiceFlow(flowInstanceId: string): Promise<flowInstanceResult> {
    try {
      const res = await serviceApi.getQueryHistory({ flowInstanceId: flowInstanceId })
      if (res?.Result) {
        const result: AnyObject = res?.Result!
        let { flowcurrent } = result
        const hlist: AnyObject[] = result.hlist
        flowpreviousid.value = result.flowpreviousid as string
        // 更改节点名
        if (flowcurrent == '提交结算') {
          flowcurrent = '结束'
        }
        const arrTemp: AnyObject[] = cloneDeep(hlist)
        const timeListTmp: flowPathItem[] = formatFlowInfo(hlist, flowcurrent, allNodeLists) // 全部节点
        // 数据特殊处理（审批时长提前）
        for (let i = 1; i < timeListTmp.length; i++) {
          // 将当前对象中指定键的值提前到前一个对象
          timeListTmp[i - 1]['intervalTime'] = timeListTmp[i]['intervalTime']
        }
        timeListTmp[timeListTmp.length - 1]['intervalTime'] = 0 // 最后一个对象中指定键的值置空
        // 合并数组
        const currentNodeItem = timeListTmp.find((item: AnyObject) => item.activityName == flowcurrent)!
        allTimeList.value = timeListTmp
        return { operationHistory: arrTemp, currentNode: { activityName: currentNodeItem.activityName, number: currentNodeItem.number } }
      } else {
        // 新建时创建空进度条
        allTimeList.value = timelistTemplate(allNodeLists, true, 1)
        return { operationHistory: [], currentNode: { activityName: '', number: 0 } }
      }
    } catch (err) {
      return { operationHistory: [], currentNode: { activityName: '', number: 0 } }
    } finally {
      console.log('time-all', allTimeList.value)
    }
  }
  return {
    allTimeList,
    flowpreviousid,
    operationHistory,
    currentNode
  }
}

/**
 * 生成进度条模板
 * @param {string[]} listNodeName 上面的节点名列表
 * @param {boolean} isInit 是否创建初始化,起始点会被激活
 * @param {number} startIndex 起始索引
 */
export const timelistTemplate = function (listNodeName: string[], isInit: boolean = false, startIndex: number = 1): flowPathItem[] {
  let number = startIndex
  const listTemplate: flowPathItem[] = []
  listNodeName.forEach((value, index) => {
    const item: flowPathItem = {
      activityName: value, // 节点名
      createTime: '', // 创建时间
      intervalTime: 0, // 审批时长
      isNode: true,
      number: number, // 序号
      userDept: undefined,
      isFinished: false, // 已完成节点
      isApproved: false, // 是否手动审批过（非自动审批）
      isAutoHiden: false, // 是否跳过隐藏
      isCurrent: false // 当前节点
    }
    // 是否创建初始化,起始点会被激活
    if (index == 0 && isInit) {
      item.isCurrent = true
    }
    // 判断是否隐藏
    if (hidenNodeLists.includes(value)) {
      item.isAutoHiden = true
    }
    number += 1
    listTemplate.push(item)
  })
  return listTemplate
}

/**
 * 流程节点赋值
 * @param {AnyObject[]} operationRecords - 操作记录
 * @param {string} flowcurrent - 当前节点
 * @param {string[]} nodeList - 当前节点
 * @returns {flowPathItem[]}
 */
export const formatFlowInfo = function (operationRecords: AnyObject[], flowcurrent: string, nodeList: string[]): flowPathItem[] {
  let resList = []
  const filterList: AnyObject[] = []
  // 进度条模板
  let listTemplate: flowPathItem[] = []
  listTemplate = timelistTemplate(nodeList, false, 1)
  if (!operationRecords || operationRecords.length == 0) {
    return listTemplate
  }
  // 判定索引
  let startIndex = -1
  let finishTag = false // 结束标签
  startIndex = listTemplate.findIndex((o) => o.activityName === flowcurrent) // 倒序开始的索引
  // 如果未找到当前节点，返回模板
  if (startIndex === -1) {
    return listTemplate
  }
  try {
    const map = new Map()
    operationRecords.forEach((item) => {
      if (!map.has(item.Content)) {
        map.set(item.Content, item)
        filterList.push(item)
      }
    })
    // 倒序遍历
    resList = cloneDeep(listTemplate) // 深拷贝
    for (let i = resList.length - 1; i >= 0; i--) {
      const item: flowPathItem = resList[i]
      if (startIndex < i) {
        continue // 未完成节点不操作
      } else if (startIndex === i) {
        item.isCurrent = true // 当前节点
        finishTag = true
        continue
      }
      if (finishTag) {
        item.isFinished = true
        item.isApproved = false
      }
      const res: AnyObject | undefined = filterList.find((o) => o.Content === item.activityName)
      // 没有找到跳过
      if (!res) {
        continue // 跳过
      }
      // 找到了对应的操作记录，没找到直接添加
      item.userName = res.CreateUserName
      // 提交步骤
      if (res.ApprovalResult !== '驳回') {
        item.createTime = res.CreateDate
        item.intervalTime = res.IntervalTime
        item.isCurrent = false
        // 自动审批/自动流转
        // if (res.Remark === '自动审批' || res.Remark === '自动流转') {
        //   item.isSkip = true
        // }
      }
    }
  } catch (err) {
    return listTemplate
  }
  return resList
}
