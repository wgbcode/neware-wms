import { shallowRef } from 'vue'
import type { RowData } from '../types'
import { queryList } from './useSearch'
import type { HooksParams } from '../index.vue'
import { useTemplateRef } from 'vue'

export const currentPageIndex = shallowRef<number>(1)
export const pageLimit = shallowRef<number>(200)
export const loading = shallowRef<boolean>(false)
export const selectedInfo = shallowRef<AgSelectedInfo<RowData>>({ isSelectAll: false, selectedData: [] })
export const tableData = shallowRef<RowData[]>([])
export const tableConfig: AgTableConfig = { lazyEnable: false, serverSortEnable: true }
export const useTable = (params: HooksParams) => {
  const { initSearch } = params
  const agTable = useTemplateRef<AgGridInstance<RowData>>('agTable')
  const columns = shallowRef<AgColumnConfig[]>([
    { type: 'checked', pinned: 'left' },
    { type: 'index', pinned: 'left' },
    { headerName: '单据编号', field: 'invoiceOrder', width: 90, pinned: 'left', compName: 'arrow' },
    { headerName: '基础单号', field: 'transportDocOrder', width: 90, pinned: 'left', compName: 'arrow' },
    { headerName: '来源单号', field: 'sourceNumber', width: 90, pinned: 'left', compName: 'arrow' },
    { headerName: 'PL单号', field: 'deliverOrder', width: 90, compName: 'arrow' },
    { headerName: '业务伙伴代码', field: 'cardCode', width: 120 },
    { headerName: '业务伙伴名称', field: 'cardName', width: 200 },
    { headerName: '付款条款', field: 'payPlanName', width: 80 },
    { headerName: '单据金额', field: 'docTotal', width: 80, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '币种', field: 'currencyCode', width: 60 },
    { headerName: '标识', field: 'saleIdentify', width: 70 },
    { headerName: '更新时间', field: 'updateTime', width: 120, formatType: 'dateTime', sortable2: 'custom' },
    { headerName: '创建时间', field: 'createTime', width: 120, formatType: 'dateTime', sortable2: 'custom' },
    { headerName: '时长', field: 'timeDur', width: 80 },
    { headerName: '创建者', field: 'creator', width: 70 },
    { headerName: '销售员', field: 'salesMan', width: 100 },
    { headerName: '账单期间', field: 'checkMonth', width: 120 }
  ])
  function serverSortHandler({ colId, sort }: AgSortParams) {
    queryList.value = { ...queryList.value, sortOrder: sort, sortName: colId }
    initSearch()
  }
  return { agTable, columns, tableConfig, tableData, loading, selectedInfo, currentPageIndex, pageLimit, serverSortHandler }
}
