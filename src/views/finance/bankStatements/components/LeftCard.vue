<template>
  <div class="c-h100p c-relative c-pr15">
    <c-table :key="isRadioMode" ref="table" :data="data" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-w100p c-h100p"> </c-table>
    <i class="triangle" :data-right="isShowRight" @click="toggleRightCard"></i>
  </div>
</template>

<script setup lang="tsx">
import type { RowData } from '@/views/finance/bankStatements/types'
import { computed, shallowRef, nextTick } from 'vue'

const props = defineProps({
  data: {
    type: Array<RowData>,
    required: true
  },
  isRadioMode: {
    type: Boolean,
    required: true
  }
})
const selectData = defineModel<RowData[]>('selectData', { required: true })
const isShowRight = defineModel<boolean>('isShowRight', { required: true })
const emit = defineEmits(['initRightCardData'])

const toggleRightCard = () => {
  isShowRight.value = !isShowRight.value
  isShowRight.value || emit('initRightCardData')
}
const initRightCardData = (value: RowData) => {
  if (props.isRadioMode) {
    selectData.value = value ? [value] : []
    emit('initRightCardData')
  }
}
const updateSelect = (value: RowData[]) => props.isRadioMode || (selectData.value = value)
const tableConfig = {
  height: '100%',
  width: '100%',
  selectRowOnClick: true, // 点击行时自动选中行
  on: { 'selection-change': updateSelect, 'current-change': initRightCardData },
  'default-sort': { prop: 'dealDate', order: 'descending' }
}
const columnsConfig = computed(() => {
  const selectItem = props.isRadioMode ? { slotName: 'radio', fixed: true } : { type: 'selection', fixed: true }
  return [
    selectItem,
    { slotName: 'index', fixed: true },
    {
      label: '交易时间',
      prop: 'dealDate',
      width: '125',
      slotName: 'datetime',
      sortable: true,
      fixed: true
    },
    { label: '收款/付款方名称', prop: 'inOutAccountName', width: '130' },
    { label: '摘要', prop: 'summary', width: '150' },
    { label: '进/出账金额', prop: 'inOutPrice', width: '90', align: 'right', slotName: 'inOutPrice' },
    { label: '标识', prop: 'indicatorName', width: '80' },
    { label: 'ERP入账状态', prop: 'amountStatus', width: '100' },
    { label: '已入账金额', prop: 'inAccountAmount', width: '90', slotName: 'price', slotParams: { format: { emptyText: '-' } } },
    { label: '未入账金额', prop: 'notInAccountAmount', width: '90', slotName: 'price', slotParams: { format: { emptyText: '-' } } },
    { label: '凭证号', prop: 'certNo', width: '100' },
    {
      label: '银行流水号',
      prop: 'waterNo',
      width: '145',
      slotName: 'addArrow'
    }
  ]
})

// 模式切换（单选|多选）时、提交成功后清空选择
type TableInstance = { getInstance: Function } | null
const table = shallowRef<TableInstance>(null)
async function clearSelectedData() {
  await nextTick()
  const tableInstance = table.value?.getInstance()
  tableInstance.clearSelection() // 多选时行清空
  tableInstance.setCurrentRow() // 单选时行清空
  selectData.value = [] // 行选中响应数据清空
}

// 将组件方法暴露出去
defineExpose({ clearSelectedData })
</script>

<style scoped lang="scss">
.triangle {
  position: absolute;
  top: 2px;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  cursor: pointer;
}

.triangle[data-right='false'] {
  right: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid #a58484;
}

.triangle[data-right='true'] {
  right: -10px;
  border-left: 10px solid #a58484;
  border-right: 10px solid transparent;
}
</style>
