import CustomerIcons from '@/components/customerIcons/index.vue'
import Icon from '@/components/global/dynamicImport/icon/index.vue'
import LinkUser from '@/components/global/dynamicImport/linkUser/index.vue'
import type { ValueFormatterParams } from 'ag-grid-community'
import { shallowRef, defineComponent } from 'vue'
import type { RowData } from '../types'
import { queryList } from './useSearch'
import type { HooksParams } from '../index.vue'
import { useTemplateRef } from 'vue'
import ProgressBar from '@/components/progressBar/index.vue'

export const currentPageIndex = shallowRef<number>(1)
export const pageLimit = shallowRef<number>(200)
export const loading = shallowRef<boolean>(false)
export const selectedInfo = shallowRef<AgSelectedInfo<RowData>>({ isSelectAll: false, selectedData: [] })
export const tableData = shallowRef<RowData[]>([])
export const tableConfig: AgTableConfig = { lazyEnable: false, serverSortEnable: true }
export const useTable = (params: HooksParams) => {
  const { initSearch } = params
  const agTable = useTemplateRef<AgGridInstance<RowData>>('agTable')
  const cardCodeComp = defineComponent({
    props: { params: { type: Object as AgParams<RowData>, required: true } },
    setup(props) {
      const { cardCode, clientInfo } = props.params.data!
      return () => (
        <div class="c-flex-ycenter">
          <Icon name="arrow" color="var(--tc-brand)" size="12" class="c-mr2 c-mb1 c-cursor-p" />
          <span>{cardCode}</span>
          <CustomerIcons data={clientInfo} />
        </div>
      )
    }
  })
  const slpNameComp = defineComponent({
    props: { params: { type: Object as AgParams<RowData>, required: true } },
    setup(props) {
      const { salesMan, salesManType, salesManId } = props.params.data!
      return () => <LinkUser type={salesManType} userId={salesManId} text={salesMan} />
    }
  })
  const progressNodesComp = defineComponent({
    props: { params: { type: Object as AgParams<RowData>, required: true } },
    setup(props) {
      const { progressNodes } = props.params.data!
      return () => progressNodes && <ProgressBar data={progressNodes} />
    }
  })
  const checkStatusRenderer = (params: ValueFormatterParams) => (params.value ? '已对账' : '未对账')
  const isPaidRenderer = (params: ValueFormatterParams) => (params.value ? '已支付' : '未支付')
  const columns = shallowRef<AgColumnConfig[]>([
    { type: 'checked', pinned: 'left' },
    { type: 'index', pinned: 'left' },
    { headerName: '单据编号', field: 'invoiceOrder', width: 90, pinned: 'left', compName: 'arrow' },
    { headerName: '基础单号', field: 'transportDocOrder', width: 90, pinned: 'left', compName: 'arrow' },
    { headerName: '来源单号', field: 'sourceNumber', width: 90, pinned: 'left', compName: 'arrow' },
    { headerName: 'PL单号', field: 'deliverOrder', width: 90, compName: 'arrow' },
    { headerName: '业务伙伴代码', field: 'cardCode', width: 90, cellRenderer: cardCodeComp },
    { headerName: '业务伙伴名称', field: 'cardName', width: 180 },
    { headerName: '付款条款', field: 'payPlanName', width: 60 },
    { headerName: '单据金额', field: 'docTotal', width: 80, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '币种', field: 'currencyCode', width: 40 },
    { headerName: '标识', field: 'saleIdentify', width: 70 },
    { headerName: '更新时间', field: 'updateTime', width: 120, formatType: 'dateTime', sortable2: 'custom' },
    { headerName: '创建时间', field: 'createTime', width: 120, formatType: 'dateTime', sortable2: 'custom' },
    { headerName: '时长', field: 'timeDur', width: 70 },
    { headerName: '创建者', field: 'creator', width: 60 },
    { headerName: '销售员', field: 'salesMan', width: 110, cellRenderer: slpNameComp },
    { headerName: '对账状态', field: 'checkStatus', width: 60, cellRenderer: checkStatusRenderer },
    { headerName: '账单期间', field: 'checkMonth', width: 60 },
    { headerName: '单据状态', field: 'isPaid', width: 60, cellRenderer: isPaidRenderer },
    { headerName: '进度', field: 'progressNodes', width: 70, cellRenderer: progressNodesComp }
  ])
  function serverSortHandler({ colId, sort }: AgSortParams) {
    queryList.value = { ...queryList.value, sortOrder: sort, sortName: colId }
    initSearch()
  }
  return { agTable, columns, tableConfig, tableData, loading, selectedInfo, currentPageIndex, pageLimit, serverSortHandler }
}
