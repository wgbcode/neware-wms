<template>
  <div class="customer-info">
    <c-table :data="tableData" :columnsConfig="columnsConfig">
      <template #CreateDate="row">
        <span>{{ dateFormat(row.CreateDate) }}</span>
      </template>
      <template #CreateUserName="row">
        <div class="text-span">
          <img class="pointer" :src="iconLink" alt="SVG Icon" @click="() => {}" />
          <span v-if="!row.DeptName">{{ row.CreateUserName }}</span>
          <span v-else>{{ row.DeptName }}-{{ row.CreateUserName }}</span>
        </div>
      </template>
      <template #IntervalTime="row">
        <span v-if="row.durationInfo" :style="{ color: row.durationInfo.color }">{{ row.durationInfo.text || '00:00:00' }}</span>
      </template>
      <template #ApprovalResult="row">
        <div v-if="!row.isOperRow">
          <span class="text-span" :class="redApprovalResult.includes(row.ApprovalResult) ? colorClass[1] : colorClass[0]">{{
            row.ApprovalResult
          }}</span>
        </div>
        <div v-else>
          <el-select ref="elSelect" v-model="row.ApprovalResult" size="small" @change="onApprovalChange(row)" placeholder="请选择">
            <el-option v-for="item in commonApprovalList" :key="item.value" :label="item.label" :value="item.value" :class="item.class"></el-option>
          </el-select>
        </div>
      </template>
    </c-table>
  </div>
</template>

<script setup lang="tsx">
// vue
import { type PropType, ref, shallowRef, computed, watch } from 'vue'
import { authStore } from '@/stores/auth'
import type { currentNodeStructure } from '@/views/serve/serviceDetail/serviceDetailTypes'
import { dateFormat, getDurationBySecond } from '@/utils/format'
import { getURL } from '@/utils/common'
import { cloneDeep } from 'lodash-es'
import moment from 'moment'
const props = defineProps({
  operationHistory: {
    type: Array,
    default: () => []
  },
  commonDetail: {
    type: Object,
    default: null
  },
  currentNode: {
    type: Object as PropType<currentNodeStructure>,
    default: null
  }
})
const iconLink = getURL('assets/icons/icon-link.svg')
const redApprovalResult = ['驳回', '放弃', '关闭', '撤回'] // 红色文字
const ALLOW_REFUSE = ['业务员审批', '总经理审批', '生成销售订单', '技术员抢单', '仓库入库', '品质验收', '服务单回访'] // 允许拒绝的节点
const ALLOW_CLOSE = ['业务员审批', '服务单回访'] // 允许关闭的节点
const colorClass = ['greenWord', 'redWord'] // 文字样式
const approvalList = [
  { label: '同意', value: '1', class: 'greenWord' },
  { label: '驳回', value: '2', class: 'redWord' },
  { label: '关闭', value: '-1', class: 'redWord' }
]
const tableData = ref([{}])
const isOper = shallowRef(false) // 是否操作
const emits = defineEmits(['operApproval'])
const content = shallowRef<string>('') // 输出内容
const columnsConfig = shallowRef([
  { type: 'index', width: 40 },
  { label: '操作记录', prop: 'Content', width: 150 },
  { label: '操作人', slotName: 'CreateUserName', width: 140 },
  { label: '操作时间', slotName: 'CreateDate', width: 150 },
  { label: '审批时长', slotName: 'IntervalTime', align: 'right', width: 84 },
  { label: '审批结果', slotName: 'ApprovalResult', width: 60 },
  { label: '备注', prop: 'Remark', slotName: 'Remark', isCustomizeHeader: true, width: 400 }
])
// 监听记录数据
const dataGroup = computed(() => {
  return { operationHistory: props.operationHistory, commonDetail: props.commonDetail }
})
const commonApprovalList = computed(() => {
  if (ALLOW_REFUSE.includes(props.currentNode?.activityName)) {
    let list = []
    if (ALLOW_CLOSE.includes(props.currentNode?.activityName)) {
      list = cloneDeep(approvalList) // 含关闭
    } else {
      list = cloneDeep(approvalList.slice(0, 2))
    }
    return list
  } else {
    const list = cloneDeep(approvalList.slice(0, 1))
    return list
  }
})
watch(
  dataGroup,
  (val) => {
    if (val.commonDetail && val.operationHistory.length > 0) {
      // 当前用户当前节点可以审批才添加
      if (val.commonDetail.isCanAudit) {
        isOper.value = true
      }
      const operationHistory = val.operationHistory as AnyObject[]
      dataProcessing(operationHistory)
    }
  },
  { deep: true }
)
// 数据处理
function dataProcessing(operationHistory: AnyObject[]) {
  if (!operationHistory || !operationHistory.length) {
    return
  }
  let operationList = cloneDeep(operationHistory)
  // 当前用户当前节点可以审批才添加
  if (isOper.value) {
    let lastApproveTime = operationList[operationList.length - 1].CreateDate
    let length = new Date().getTime() - new Date(lastApproveTime).getTime()
    let item = {
      isOperRow: true, // 操作行
      Content: content,
      DeptName: authStore?.userInfo?.orgName,
      CreateUserName: authStore?.userInfo?.userName,
      CreateUserId: authStore?.userInfo?.userId,
      CreateDate: moment(new Date()).format('YYYY.MM.DD HH:mm:ss'),
      IntervalTime: Number(length / 1000) || 0,
      ApprovalResult: '1'
    }
    operationList.push(item)
    emits('operApproval', item)
  }
  // 数据处理
  const colorMap = new Map([
    [0, '#42BF39'],
    [0.5, '#F8B500'],
    [1, '#EA3553']
  ])
  console.log('handler', operationList)
  operationList = operationList.map((oper) => {
    return {
      ...oper,
      durationInfo: getDurationBySecond(oper.IntervalTime, colorMap, false)
    }
  })
  tableData.value = operationList
}
function onApprovalChange(row: AnyObject) {
  emits('operApproval', row)
}
</script>
<style lang="scss" scoped></style>
