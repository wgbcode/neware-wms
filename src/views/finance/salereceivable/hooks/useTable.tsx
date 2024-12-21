import { postMessage } from '@/hooks/useMessage'
import { shallowRef, useTemplateRef, defineComponent, reactive, computed } from 'vue'
import { numberFormat } from '@/utils/format'
import StepPercentBar from '@/components/stepPercentBar/index.vue'
import Icon from '@/components/global/dynamicImport/icon/index.vue'
import CustomerIcons from '@/components/customerIcons/index.vue'
import LinkUser from '@/components/global/dynamicImport/linkUser/index.vue'
import type { ValueFormatterParams, CellClassParams } from 'ag-grid-community'
import { runWithLoadingState } from '@/utils/common'
import PercentBar, { type PercentBarInfo } from '@/components/percentBar/index.vue'
import { canInterReconMap, dataFromMap } from '@/views/finance/common/js/map'
import type { RowData } from '../types'
import { queryList } from './useSearch'
import type { HooksParams } from '../index.vue'
import { ElMessage } from 'element-plus'

export const currentPageIndex = shallowRef<number>(1)
export const pageLimit = shallowRef<number>(200)
export const loading = shallowRef<boolean>(false)
export const tableData = shallowRef<RowData[]>([])
export const tableConfig = reactive<AgTableConfig>({
  lazyEnable: false,
  serverSortEnable: true,
  attr: {
    context: {
      isDefaultExpandTreeData: true
    }
  }
})
export const selectedInfo = shallowRef<AgSelectedInfo<RowData>>({ isSelectAll: false, selectedData: [] })
export const isTreeDataMode = shallowRef<boolean>(false)
export const useTable = (params: HooksParams) => {
  const { initSearch } = params
  const agTable = useTemplateRef<AgGridInstance<RowData>>('agTable')
  const pcntFormatter = (params: ValueFormatterParams) => {
    return params.value ? numberFormat(params.value, true) + '%' : ''
  }
  const invoiceBalCellStyle = (params: CellClassParams) => {
    const colorMap = new Map([
      [params.value <= 0, 'var(--tc-global-green)'],
      [params.value > 0, 'var(--tc-global-red)']
    ])
    return { color: colorMap.get(true) ?? '' }
  }
  const overDueDaysCellStyle = (params: CellClassParams) => {
    const colorMap = new Map([
      [params.value <= 90, 'var(--tc-primary-text)'],
      [params.value > 90 && params.value <= 180, 'var(--tc-global-yellow)'],
      [params.value > 180, 'var(--tc-global-red)']
    ])
    return { color: colorMap.get(true) ?? '' }
  }
  const receiptAmtPcntStyle = (params: CellClassParams) => {
    const colorMap = new Map([
      [params.value < 30, 'var(--tc-global-red)'],
      [params.value >= 30 && params.value <= 70, 'var(--tc-global-yellow)'],
      [params.value > 70, 'var(--tc-global-green)']
    ])
    return { color: colorMap.get(true) ?? '' }
  }
  const slpNameComp = defineComponent({
    props: { params: { type: Object as AgParams<RowData>, required: true } },
    setup(props) {
      const { userId, userType, slpName } = props.params.data!
      return () => <LinkUser type={userType} userId={userId} text={slpName} />
    }
  })
  const cardCodeComp = defineComponent({
    props: { params: { type: Object as AgParams<RowData>, required: true } },
    setup(props) {
      const { cardCode, clientInfo } = props.params.data!
      return () => (
        <div class="c-flex-ycenter">
          <Icon name="arrow" color="var(--tc-brand)" size="12" class="c-mr2 c-mb1 c-cursor-p" />
          <span>{cardCode}</span>
          {clientInfo && <CustomerIcons data={clientInfo} />}
        </div>
      )
    }
  })
  const clientReconciliationDialog = useTemplateRef<DialogInstance | null>('clientReconciliationDialog')
  const docEntryComp = defineComponent({
    props: { params: { type: Object as AgParams<RowData>, required: true } },
    setup(props) {
      const { docEntry, canInterRecon, dataFrom, hasClientReconciliation, sboId, accepted } = props.params.data!
      const { statusColor, statusTag } = canInterReconMap[canInterRecon] ?? {}
      const { fromColor, fromTag } = dataFromMap[dataFrom] ?? {}
      const openDetail = () =>
        fromTag ? ElMessage({ type: 'warning', message: '该销售订单存在账套信息，暂时无法打开详情页' }) : openSaleDetail({ row: props.params.data! })
      const openFileDailog = () => clientReconciliationDialog.value!.openDialog({ orderId: docEntry, sboId })
      const textStyle = { color: accepted === 'Y' ? 'var(--tc-global-green)' : 'var(--tc-primary-text)' }
      return () => (
        <div class="c-flex-ycenter" style={{ display: docEntry ? 'flex' : 'none' }}>
          <Icon name="arrow" color="var(--tc-brand)" size="12" class="c-mr2 c-mb1 c-cursor-p" click={openDetail} stop={true} />
          <span style={textStyle}>{'SE-' + docEntry}</span>
          <span class="c-fs12" style={`scale:0.65;color:${statusColor}`}>
            {statusTag}
          </span>
          <span class="c-fs12" style={`scale:0.75;color:${fromColor}`}>
            {fromTag}
          </span>
          {hasClientReconciliation && <Icon name="btn-attachment" color="#cdcdcd" size="12" class="c-ml2 c-cursor-p" click={openFileDailog} />}
        </div>
      )
    }
  })
  const remarkDrawer = useTemplateRef<{ openDrawer: Function }>('remarkDrawer')
  const remarkComp = defineComponent({
    props: { params: { type: Object as AgParams<RowData>, required: true } },
    setup(props) {
      const { data } = props.params
      const { hasRemark, docEntry, sboId } = data!
      const iconColor = hasRemark ? 'var(--tc-global-yellow)' : 'var(--tc-global-gray)'
      const openDrawer = async () => await remarkDrawer.value!.openDrawer({ rowData: [data], queryOrder: [{ docEntry, sboId }] })
      const newOpenDrawer = runWithLoadingState(openDrawer, loading) // 加上 loading 效果
      return () => (docEntry ? <Icon name="btn-remark" color={iconColor} size="13" class="c-cursor-p c-mt3" click={newOpenDrawer} /> : '')
    }
  })
  const riskLevelComp = defineComponent({
    props: { params: { type: Object as AgParams<RowData>, required: true } },
    setup(props) {
      const { stockValue, receiptAmt } = props.params.data!
      const info: PercentBarInfo = { isHidden: true }!
      if (stockValue) {
        info.isHidden = false
        info.num = Number((Number((receiptAmt - stockValue) / stockValue) * 100).toFixed(0))
        info.outerColor = info.num <= 0 ? 'var(--tc-progress-red)' : ''
        info.interColor = new Map([
          [info.num < 0, 'var(--tc-progress-green)'],
          [info.num >= 0 && info.num < 15, 'var(--tc-progress-yellow)'],
          [info.num >= 15, 'var(--tc-progress-green)']
        ]).get(true)
      }
      return () => <PercentBar info={info} />
    }
  })
  const progressComp = defineComponent({
    props: { params: { type: Object as AgParams<RowData>, required: true } },
    setup(props) {
      const { saleOrderPaymentProgress } = props.params.data!
      return () => <StepPercentBar info={saleOrderPaymentProgress ?? []} />
    }
  })
  const baseColumns: AgColumnConfig[] = [
    { headerName: '订单总额', field: 'orderAmt', width: 76, formatType: 'price', context: { emptyValue: '-' }, sortable2: 'custom' },
    { headerName: '币种', field: 'docCur', width: 55, sortable2: 'custom' },
    { headerName: '退货金额', field: 'creditAmt', width: 60, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '交货金额', field: 'deliveryAmt', width: 70, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '比例', field: 'deliveryAmtPcnt', width: 40, align: 'right', valueFormatter: pcntFormatter },
    { headerName: '开票金额', field: 'billAmt', width: 60, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '比例', field: 'billAmtPcnt', width: 40, align: 'right', valueFormatter: pcntFormatter },
    { headerName: '回款金额', field: 'receiptAmt', width: 76, formatType: 'price', context: { emptyValue: '-' }, sortable2: 'custom' },
    {
      headerName: '比例',
      field: 'receiptAmtPcnt',
      width: 55,
      align: 'right',
      valueFormatter: pcntFormatter,
      cellStyle: receiptAmtPcntStyle,
      sortable2: 'custom'
    },
    {
      headerName: '应收余额',
      field: 'invoiceBal',
      width: 76,
      formatType: 'price',
      context: { emptyValue: '-' },
      sortable2: 'custom',
      cellStyle: invoiceBalCellStyle
    },
    { headerName: '比例', field: 'invoiceBalPcnt', width: 55, align: 'right', valueFormatter: pcntFormatter, sortable2: 'custom' },
    { headerName: '交货物料成本', field: 'stockValue', width: 90, formatType: 'price', context: { emptyValue: '-' }, hide: true },
    { headerName: '逾期金额', field: 'overDueAmt', width: 60, formatType: 'price', context: { emptyValue: '-' } },
    { headerName: '比例', field: 'overDueAmtPcnt', width: 40, align: 'right', valueFormatter: pcntFormatter },
    { headerName: '逾期天数', field: 'overDueDays', width: 60, align: 'right', formatType: 'number', cellStyle: overDueDaysCellStyle },
    { headerName: '进度', field: 'progress', width: 70, cellRenderer: progressComp },
    { headerName: '更新日期', field: 'orderUpdateDate', width: 77, formatType: 'date', sortable2: 'custom', sort: 'desc' },
    { headerName: '创建日期', field: 'orderCreateDate', width: 77, formatType: 'date', sortable2: 'custom' },
    { headerName: '成本利润率', field: 'riskLevel', width: 80, cellRenderer: riskLevelComp, hide: true },
    { headerName: '是否中间商', field: 'middleman', width: 80, hide: true },
    { headerName: '备注', field: 'remark', width: 33, cellRenderer: remarkComp },
    { headerName: 'SE备注', field: 'comments', width: 60, hide: true }
  ]
  const normalColumns: AgColumnConfig[] = [
    { type: 'checked', pinned: 'left' },
    { type: 'index', pinned: 'left' },
    { headerName: '标识', field: 'indicator', width: 60, pinned: 'left', sortable2: 'custom' },
    { headerName: '业务伙伴代码', field: 'cardCode', width: 125, cellRenderer: cardCodeComp, pinned: 'left', sortable2: 'custom' },
    { headerName: '业务伙伴名称', field: 'cardName', width: 150, pinned: 'left', sortable2: 'custom' },
    { headerName: '销售员', field: 'slpName', width: 110, cellRenderer: slpNameComp, pinned: 'left', sortable2: 'custom' },
    { headerName: '销售订单号', field: 'docEntry', width: 100, cellRenderer: docEntryComp, pinned: 'left', sortable2: 'custom' },
    ...baseColumns
  ]
  const treeColumns: AgColumnConfig[] = [
    { type: 'checked', pinned: 'left' },
    { type: 'index', pinned: 'left' },
    {
      headerName: '销售员',
      field: 'slpName',
      width: 120,
      pinned: 'left',
      compName: 'treeExpand',
      context: { extraOption: { linkUser: { show: true, type: 'userType', id: 'userId', text: 'slpName' } } }
    },
    {
      headerName: '业务伙伴代码',
      field: 'cardCode',
      width: 135,
      pinned: 'left',
      compName: 'treeExpand',
      context: { extraOption: { customerIcons: { show: true, data: 'clientInfo' } } }
    },
    { headerName: '业务伙伴名称', field: 'cardName', width: 150, pinned: 'left' },
    { headerName: '销售订单号', field: 'docEntry', width: 90, cellRenderer: docEntryComp, pinned: 'left' },
    { headerName: '标识', field: 'indicator', width: 60, pinned: 'left' },
    ...baseColumns
  ]
  const columnKey = shallowRef<string[]>([])
  const columns = computed<AgColumnConfig[]>({
    get: () => {
      const result = isTreeDataMode.value ? treeColumns : normalColumns
      if (columnKey.value.length === 0) {
        return result
      } else {
        return result.flatMap((i) => (!i.field || columnKey.value.includes(i.field) ? { ...i, hide: false } : []))
      }
    },
    set: (newColumns) => {
      columnKey.value = newColumns.flatMap((i) => i.field ?? [])
    }
  })
  // 打开销售订单详情页(BI)
  function openSaleDetail({ row }: TableEvenParams<RowData>) {
    postMessage('openSaleOrderDetail', { docEntry: row.docEntry })
  }
  function serverSortHandler({ colId, sort }: AgSortParams) {
    queryList.value = { ...queryList.value, sortOrder: sort, sortName: colId }
    initSearch()
  }
  function addBatchRemark() {
    const { selectedData } = selectedInfo.value
    if (selectedData.length === 0) {
      ElMessage({ type: 'warning', message: '请选择单据' })
    } else {
      const queryOrder = selectedData.map((i) => ({ docEntry: i.docEntry, sboId: i.sboId }))
      remarkDrawer.value!.openDrawer({ rowData: selectedData, queryOrder, isBatch: true })
    }
  }
  return {
    agTable,
    tableData,
    tableConfig,
    columns,
    loading,
    selectedInfo,
    currentPageIndex,
    pageLimit,
    isTreeDataMode,
    serverSortHandler,
    addBatchRemark
  }
}
