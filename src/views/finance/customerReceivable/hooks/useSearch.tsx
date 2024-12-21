import { shallowRef, computed } from 'vue'
import type { HooksParams } from '../index.vue'

export const queryList = shallowRef<QueryList>({
  isShowAllAccount: false,
  receivableAmount: [],
  contractAmount: [],
  recieveAblePercnt: [],
  overDuePercent: [],
  sortOrder: 'desc', // desc 降序，asc 升序
  sortName: 'cardCode'
})
export const orderAmtList = [
  { label: 'x<=0.05', value: ',0.05' },
  { label: '0.05<X≤10', value: '0.05,10' },
  { label: '10<X≤50', value: '10,50' },
  { label: '50<X≤100', value: '50,100' },
  { label: '100<X≤500', value: '100,500' },
  { label: '500<X', value: '500,' }
]
export const oidcinfo = shallowRef<SelectList[]>([])
export const useSearch = (params: HooksParams) => {
  const { initSearch, exportTable } = params
  const indicatorList = computed<SelectList[]>(() => {
    const newList = oidcinfo.value.map((i) => ({ label: i.name, value: i.id }))
    return [{ label: '无', value: 'N' }, ...newList]
  })
  const checkStatusList: SelectList[] = [
    { label: '全部', value: true },
    { label: '未清', value: false }
  ]
  const queryConfig = computed(() => {
    const isShowAllAccountAttrs = { clearable: true, placeholder: '是否逾期', optionV2: checkStatusList }
    const indicatorAttrs = { clearable: true, placeholder: '标识', optionV2: indicatorList, multiple: true }
    return [
      { prop: 'isShowAllAccount', name: 'select', attr: isShowAllAccountAttrs, on: { change: initSearch } },
      { prop: 'indicatorList', name: 'select', attr: indicatorAttrs },
      { prop: 'cardCodeOrName', name: 'input', attr: { placeholder: '业务伙伴代码/名称' }, on: { change: initSearch } },
      { prop: 'salesMan', name: 'input', attr: { placeholder: '销售员' }, on: { change: initSearch } },
      { prop: 'saleOrder', name: 'input', attr: { placeholder: '销售订单号' }, on: { change: initSearch } },
      { prop: 'receivableAmount', name: 'textPicker', attr: { title: '应收总金额' }, filter: true },
      { prop: 'contractAmount', name: 'textPicker', attr: { title: '合同总金额' }, filter: true },
      { prop: 'recieveAblePercnt', name: 'textPicker', attr: { suffix: '%', title: '应收占比' }, filter: true },
      { prop: 'overDuePercent', name: 'textPicker', attr: { suffix: '%', title: '逾期占比' }, filter: true },
      { text: '查询', name: 'button', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: initSearch } },
      { text: '对账单', name: 'button', attr: { type: 'primary', iconName: 'btn-export-table' }, on: { click: exportTable } }
    ]
  })
  return { queryList, queryConfig, oidcinfo }
}
