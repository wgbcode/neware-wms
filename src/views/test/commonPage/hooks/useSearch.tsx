import { shallowRef, computed } from 'vue'
import type { HooksParams } from '../index.vue'

export const queryList = shallowRef<QueryList>({})
export const oidcinfo = shallowRef<SelectList[]>([])
export const useSearch = (params: HooksParams) => {
  const { initSearch } = params
  const statusList: SelectList[] = [
    { label: '未对账', value: false },
    { label: '已对账', value: true }
  ]
  const queryConfig = computed(() => {
    const statusAttrs = { clearable: true, placeholder: '状态', optionV2: statusList }
    return [
      { prop: 'keyword', name: 'input', attr: { placeholder: '基础单号/来源单号/单据编号' }, on: { change: initSearch }, style: { width: '180px' } },
      { prop: 'cardSearch', name: 'input', attr: { placeholder: '业务伙伴代码/名称' }, on: { change: initSearch } },
      { prop: 'status', name: 'select', attr: statusAttrs, on: { change: initSearch } },
      { text: '查询', name: 'button', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: initSearch } }
    ]
  })
  return { queryList, queryConfig, oidcinfo }
}
