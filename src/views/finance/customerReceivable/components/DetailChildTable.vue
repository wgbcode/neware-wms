<template>
  <!-- :style="{ height: (tableData.length + 2) * 20 + 'px' }" -->
  <div class="c-flex-column c-ml50 c-p5 c-h130">
    <c-ag-table ref="agTable" :config="tableConfig" :data="tableData" :columns="columns" class="c-flex-1" style="width: 750px" :loading="loading" />
  </div>
</template>

<script setup lang="tsx">
import { shallowRef, useTemplateRef, onMounted, defineComponent } from 'vue'
import type { ICellRendererParams } from 'ag-grid-community'
import type { ValueFormatterParams } from 'ag-grid-community'
import { numberFormat } from '@/utils/format'
import { GetClientDueDetailWaterList } from '../request'
import { requestSuccess } from '@/utils/requestSuccess'
import Icon from '@/components/global/dynamicImport/icon/index.vue'

// 点击行数据会自动传入
interface Props {
  params: ICellRendererParams
}
const props = defineProps<Props>()
const { data } = props.params

// 组件数据初始化
onMounted(() => {
  requestSuccess({ api: GetClientDueDetailWaterList, ref: tableData, params: { saleOrder: data.saleOrder }, loading })
})

interface RowData {
  accumulativeAmount: number
  accumulativePercent: number
  createTime: string
  docCur: string
  docRate: number
  percent: number
  waterAmount: number
  waterNums: string
  waterType: string
}
const loading = shallowRef<boolean>(false)
const tableData = shallowRef<RowData[]>([])
const agTable = useTemplateRef<AgGridInstance<RowData>>('agTable')
const tableConfig = {}
const pcntFormatter = (params: ValueFormatterParams) => {
  return params.value ? numberFormat(params.value, true) + '%' : ''
}
const getWaterTypeStyle = (waterType: string) => {
  return {
    color: new Map([
      [['退款', '退货'].includes(waterType), 'var(--tc-global-red'],
      [waterType === '开票', 'var(--tc-global-yellow)'],
      [waterType === '收款', 'var(--tc-global-blue)'],
      [waterType === '交货', 'var(--tc-global-darkyellow)']
    ]).get(true)
  }
}
const waterTypeComp = defineComponent({
  props: { params: { type: Object, required: true } },
  setup(props) {
    const { waterType } = props.params.data
    const style = getWaterTypeStyle(waterType)
    return () => (
      <div class="c-flex-ycenter">
        <Icon name="arrow" color="var(--tc-brand)" size="12" class="c-mr2 c-mb1 c-cursor-p" />
        <span style={style}>{waterType}</span>
      </div>
    )
  }
})
const columns = shallowRef([
  { type: 'index', pinned: 'left' },
  { headerName: '类型', field: 'waterType', width: 60, cellRenderer: waterTypeComp },
  { headerName: '流水号', field: 'waterNums', width: 150 },
  { headerName: '创建日期', field: 'createTime', width: 80, formatType: 'date' },
  { headerName: '流水金额', field: 'waterAmount', width: 100, formattype: 'price', align: 'right', context: { emptyvalue: '-' } },
  { headerName: '币种', field: 'docCur', width: 60 },
  { headerName: '占比', field: 'percent', width: 60, valueFormatter: pcntFormatter, align: 'right' },
  { headerName: '累计金额', field: 'accumulativeAmount', width: 100, formattype: 'price', align: 'right', context: { emptyvalue: '-' } },
  { headerName: '累计占比', field: 'accumulativePercent', width: 80, valueFormatter: pcntFormatter, align: 'right' }
])
</script>
