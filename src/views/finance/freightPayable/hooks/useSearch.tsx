import { getDateStr, runWithLoadingState } from '@/utils/common'
import { ElMessage } from 'element-plus'
import { shallowRef, computed, useTemplateRef } from 'vue'
import type { RowData } from '../types'
import { loading, selectedInfo } from './useTable'
import type { HooksParams } from '../index.vue'

export const queryList = shallowRef<QueryList>({})
export const oidcinfo = shallowRef<SelectList[]>([])
export const useSearch = (params: HooksParams) => {
  const { initSearch } = params
  const indicatorList = computed<SelectList[]>(() => {
    const newList = oidcinfo.value.map((i) => ({ label: i.name, value: i.id }))
    return [{ label: '无', value: 'N' }, ...newList]
  })
  const checkStatusList: SelectList[] = [
    { label: '未对账', value: false },
    { label: '已对账', value: true }
  ]
  const isPaidList: SelectList[] = [
    { label: '未支付', value: false },
    { label: '已支付', value: true }
  ]
  const queryConfig = computed(() => {
    const indicatorAttrs = { clearable: true, placeholder: '标识', optionV2: indicatorList }
    const checkStatusAttrs = { clearable: true, placeholder: '对账状态', optionV2: checkStatusList }
    const isPaidAttrs = { clearable: true, placeholder: '支付状态', optionV2: isPaidList }
    return [
      { prop: 'keyword', name: 'input', attr: { placeholder: '基础单号/来源单号/单据编号' }, on: { change: initSearch }, style: { width: '180px' } },
      { prop: 'cardSearch', name: 'input', attr: { placeholder: '业务伙伴代码/名称' }, on: { change: initSearch } },
      { prop: 'indicator', name: 'select', attr: indicatorAttrs, on: { change: initSearch } },
      { prop: 'checkStatus', name: 'select', attr: checkStatusAttrs, on: { change: initSearch } },
      { prop: 'isPaid', name: 'select', attr: isPaidAttrs, on: { change: initSearch } },
      { text: '查询', name: 'button', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: initSearch } },
      { text: '对账', name: 'button', attr: { type: 'primary', iconName: 'btn-statements' }, on: { click: openReconciliationDialog } },
      {
        text: '发起付款',
        name: 'button',
        attr: { type: 'primary', iconName: 'btn-pay-money' },
        on: { click: runWithLoadingState(openPayMoneyDetail, loading) }
      }
    ]
  })
  const payMoneyDetail = useTemplateRef<DialogInstance>('payMoneyDetail')
  const reconciliationDialog = useTemplateRef<DialogInstance>('reconciliationDialog')
  async function openPayMoneyDetail() {
    const selectedData: RowData[] = selectedInfo.value.selectedData
    if (selectedData.length === 0) {
      ElMessage({ type: 'warning', message: '请选择单据' })
    } else {
      const payables = selectedData.map((i) => ({ source_id: i.sourceId, source_type: i.sourceType }))
      await payMoneyDetail.value!.openDialog(JSON.stringify(payables))
    }
  }
  function openReconciliationDialog() {
    const selectedData: RowData[] = selectedInfo.value.selectedData
    if (selectedData.length === 0) {
      ElMessage({ type: 'warning', message: '请选择单据' })
    } else {
      const tableData = [
        {
          count: selectedData.length,
          check_total: selectedData.reduce((a, b) => a + b.docTotal, 0),
          checkMonth: getDateStr('curMonth', 'yyyy.MM')
        }
      ]
      const payables = selectedData.map((i) => ({ source_id: i.sourceId, source_type: i.sourceType }))
      reconciliationDialog.value!.openDialog(tableData, payables)
    }
  }
  return { queryList, queryConfig, oidcinfo }
}
