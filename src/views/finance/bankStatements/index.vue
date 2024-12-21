<template>
  <div class="c-relative">
    <div class="c-flex-column c-h100p">
      <c-search v-model:data="queryList" :config="searchConfig" />
      <div class="c-flex c-flex-1 c-overflow-hidden">
        <LeftCard
          ref="leftCard"
          :data="tableData"
          :isRadioMode="isRadioMode"
          v-model:isShowRight="isShowRight"
          v-model:selectData="selectData"
          v-loading="loading"
          @initRightCardData="initRightCardData"
          style="transition: all 0.7s ease"
          :class="isShowRight ? 'left_card' : 'c-w100p'"
        />
        <RightCard
          ref="rightCard"
          :isShowRight="isShowRight"
          :indicator="queryList.indicator"
          style="transition: all 0.7s ease"
          @updateLeftCardData="onSearch"
          :class="isShowRight ? 'right_card' : 'c-w0'"
        />
      </div>
      <c-footer v-model:data="footerData" :options="footerOptions" @update="onSearch" />
    </div>
    <el-dialog v-model="dialogTableVisible" title="对账日志" width="80%" style="height: 100%; overflow: auto" class="dialog">
      <div class="body-context">
        <ReconciliationLog />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx">
import { shallowRef, onMounted, computed, provide, useTemplateRef } from 'vue'
import { postMessage, useMessage } from '@/hooks/useMessage'
import { BankWaterLoad, GetDropDownOptions } from './request'
import { ElMessage } from 'element-plus'
import { requestList } from '@/utils/requestList'
import LeftCard from './components/LeftCard.vue'
import RightCard from './components/RightCard.vue'
import type { RowData } from '@/views/finance/bankStatements/types'
import { keepAliveOption } from '@/utils/generateRoutes'
import { setIndicatorList } from '@/utils/setIndicatorList'
import ReconciliationLog from '@/views/reconciliationLog/index.vue'

// keep-alive
defineOptions({ name: keepAliveOption.bankStatements })

// postMessage
useMessage('bankStatements')

// 页面数据初始化
onMounted(async () => {
  onSearch()
  requestList(GetDropDownOptions, statusList)
  setIndicatorList(indicatorList)
})

// 跳转到采购付款详情页
const openPurDetail = ({ row }: TableEvenParams) => {
  const paymentId = row.paymentId
  const sourceNumber = row.sourceNumber.split(',')[0]
  postMessage('openPurchasePaymentsDetail', { paymentId, sourceNumber })
}

// 打开销售订单详情页
const openSaleDetail = ({ row }: TableEvenParams) => {
  postMessage('openSaleOrderDetail', { docEntry: row.saleOrder })
}

// 方法注入
provide('openPurDetail', openPurDetail)
provide('openSaleDetail', openSaleDetail)

const directionList: SelectList[] = [
  { label: '出账', value: '0' },
  { label: '入账', value: '1' }
]
const isShowRight = shallowRef<boolean>(false)
const loading = shallowRef<boolean>(false)
const tableData = shallowRef<RowData[]>([])
const selectData = shallowRef<RowData[]>([])
const totalCount = shallowRef<number>(0)
const footerData = shallowRef<FooterData>({ page: 1, limit: 200, time: [] })
const isRadioMode = shallowRef<boolean>(true) // 是否单选模式
const queryList = shallowRef<QueryList>({ incomeStatus: '0' })
const indicatorList = shallowRef<SelectList[]>([])
const statusList = shallowRef<SelectList[]>([])
const footerOptions = computed<FooterOptions>(() => {
  return {
    baseOption: { totalCount: totalCount.value },
    compOption: [{ name: 'pagination' }, { name: 'datePicker' }]
  }
})
const dialogTableVisible = shallowRef<boolean>(false)
const goReconciliationLog = () => (dialogTableVisible.value = true)
const searchConfig = computed(() => {
  return [
    { name: 'select', prop: 'indicator', attr: { optionV2: indicatorList, placeholder: '标识' }, on: { change: initSearch } },
    { name: 'select', prop: 'incomeStatus', attr: { optionV2: statusList, placeholder: '入账状态' } },
    { name: 'select', prop: 'waterDirection', attr: { optionV2: directionList, placeholder: '出入账' } },
    { name: 'input', prop: 'inOrOutAmount', attr: { placeholder: '进/出账金额' }, on: { change: initSearch } },
    { name: 'input', prop: 'inOutAccountName', attr: { placeholder: '收/付款名称' }, on: { change: initSearch } },
    { name: 'input', prop: 'summary', attr: { placeholder: '摘要' }, on: { change: initSearch } },
    { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: initSearch } },
    {
      name: 'button',
      text: isRadioMode.value ? '多选模式' : '单选模式',
      attr: { type: 'primary', iconName: isRadioMode.value ? 'btn-checkbox-mode' : 'btn-radio-mode' },
      on: { click: toggleSelectMode }
    },
    {
      name: 'button',
      text: '出纳入账',
      attr: { type: 'primary', iconName: 'btn-account' },
      on: { click: initRightCardData },
      isShow: !isRadioMode.value
    },
    { name: 'button', text: '对账日志', attr: { type: 'primary' }, on: { click: goReconciliationLog } }
  ]
})
const rightCard = useTemplateRef<InstanceType<typeof RightCard> | null>('rightCard')

// 右侧折叠面板数据初始化。单选时主动触发，多选时点击按钮触发
function initRightCardData() {
  const message = getMessage()
  if (message) {
    ElMessage({ type: 'warning', message })
  } else {
    rightCard.value?.initData(selectData.value) // 子组件数据初始化
    isShowRight.value || (isShowRight.value = true)
  }
}
function getMessage() {
  let message = ''
  if (selectData.value.length !== 0 || !isRadioMode.value) {
    const iName = new Set(selectData.value.map((i) => i.indicatorName))
    const inAmt = selectData.value.reduce((a, b) => a + b.inAmount, 0)
    const outAmt = selectData.value.reduce((a, b) => a + b.outAmount, 0)
    const notAmt = selectData.value.reduce((a, b) => a + b.notInAccountAmount, 0)
    const map: Map<boolean, string> = new Map([
      [notAmt === 0, '所选流水金额已全部入账'],
      [inAmt !== 0 && outAmt !== 0, '出纳入账只能是收款类型，或者付款类型'],
      [iName.size > 1, '标识不一致的，操作失败'],
      [selectData.value.length === 0, '请选择单据']
    ])
    notAmt === 0 && (selectData.value = [])
    message = map.get(true) ?? ''
  }
  return message
}

// 单选和多选模式切换
const leftCard = useTemplateRef<InstanceType<typeof LeftCard> | null>('leftCard')
function toggleSelectMode() {
  isRadioMode.value = !isRadioMode.value
  leftCard.value!.clearSelectedData()
}

// 获取表格数据
const initSearch = () => {
  footerData.value = { ...footerData.value, page: 1 }
  onSearch()
}
function onSearch() {
  loading.value = true
  const { page, limit } = footerData.value
  const tableParams = { ...queryList.value, page, limit: limit }
  BankWaterLoad(tableParams)
    .then((res) => {
      const { code, data, count } = res
      if (code === 200) {
        tableData.value = data
        totalCount.value = count || 0
        leftCard.value!.clearSelectedData() // 清空选中数据
      }
    })
    .finally(() => (loading.value = false))
}
</script>

<style lang="scss" scoped>
.left_card {
  width: 35%;
}
.right_card {
  width: 65%;
}
:deep(.el-overlay) {
  position: absolute;
  height: calc(100%);
}

:deep(.el-dialog) {
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
}

:deep(.el-dialog.dialog) {
  height: 100% !important;
}

:deep(.el-overlay-dialog) {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: auto;
}

:deep(.el-dialog__body) {
  height: calc(100% - 20px);

  .body-context {
    height: 100%;
    overflow: auto;
  }
}
</style>
