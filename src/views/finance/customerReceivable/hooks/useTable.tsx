import Icon from '@/components/global/dynamicImport/icon/index.vue'
import type { CellClassParams, ValueFormatterParams } from 'ag-grid-community'
import { shallowRef, defineComponent, useTemplateRef } from 'vue'
import type { RowData } from '../types'
import { queryList } from './useSearch'
import type { HooksParams } from '../index.vue'
import { numberFormat } from '@/utils/format'

export const currentPageIndex = shallowRef<number>(1)
export const pageLimit = shallowRef<number>(200)
export const loading = shallowRef<boolean>(false)
export const selectedInfo = shallowRef<AgSelectedInfo<RowData>>({ isSelectAll: false, selectedData: [] })
export const tableData = shallowRef<RowData[]>([])
export const tableConfig: AgTableConfig = { lazyEnable: false, serverSortEnable: true }
export const useTable = (params: HooksParams) => {
  const { initSearch } = params
  const agTable = useTemplateRef<AgGridInstance<RowData>>('agTable')
  const commonCellStyle = (params: CellClassParams) => {
    const colorMap = new Map([
      [params.value <= 30, 'var(--tc-global-green)'],
      [params.value > 30 && params.value < 60, 'var(--tc-global-yellow)'],
      [params.value >= 60, 'var(--tc-global-red)']
    ])
    return { color: colorMap.get(true) ?? '' }
  }
  const pcntFormatter = (params: ValueFormatterParams) => {
    return params.value ? numberFormat(params.value, true) + '%' : ''
  }
  const detail = useTemplateRef<DialogInstance>('detail')
  const cardCodeComp = defineComponent({
    props: { params: { type: Object as AgParams<RowData>, required: true } },
    setup(props) {
      const { cardCode } = props.params.data!
      const openDetail = () => detail.value!.openDialog({ cardCode })
      return () => (
        <div class="c-flex-ycenter">
          <Icon name="arrow" color="var(--tc-brand)" size="12" class="c-mr2 c-mb1 c-cursor-p" click={openDetail} stop={true} />
          <span>{cardCode}</span>
        </div>
      )
    }
  })
  const columns = shallowRef<AgColumnConfig[]>([
    { type: 'checked', pinned: 'left' },
    { type: 'index', pinned: 'left' },
    {
      headerName: '业务伙伴代码',
      field: 'cardCode',
      width: 115,
      pinned: true,
      sortable2: 'custom',
      cellRenderer: cardCodeComp
    },
    { headerName: '业务伙伴', field: 'cardName', width: 180, pinned: true },
    { headerName: '科目余额', field: 'balance', width: 100, formatType: 'price', context: { emptyValue: '-' } },
    {
      headerName: '应收总金额',
      field: 'receivableInvoiceTotalAmount',
      width: 100,
      formatType: 'price',
      context: { emptyValue: '-' },
      sortable2: 'custom'
    },
    { headerName: '应收占比', field: 'receivablePercent', width: 60, align: 'right', cellStyle: commonCellStyle, valueFormatter: pcntFormatter },
    { headerName: '合同总金额', field: 'contractTotalAmount', width: 100, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '交货总金额', field: 'deliveryTotalAmount', width: 100, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '收款总金额', field: 'receiveTotalAmount', width: 100, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '退货总金额', field: 'returnTotalAmount', width: 100, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '开票总金额', field: 'billTotalAmount', width: 100, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '开票应收', field: 'billReceivableAmount', width: 100, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '逾期应收', field: 'overDueAmount', width: 100, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '逾期占比', field: 'overDuePercent', width: 60, align: 'right', cellStyle: commonCellStyle, valueFormatter: pcntFormatter },
    { headerName: '最后下单时间', field: 'finalOrderDate', width: 135 },
    { headerName: '备注', field: 'common', width: 170 }
  ])
  function serverSortHandler({ colId, sort }: AgSortParams) {
    queryList.value = { ...queryList.value, sortOrder: sort, sortName: colId }
    initSearch()
  }
  return { agTable, columns, tableConfig, tableData, loading, selectedInfo, currentPageIndex, pageLimit, serverSortHandler }
}
