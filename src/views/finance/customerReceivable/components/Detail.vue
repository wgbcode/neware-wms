<template>
  <!-- 父级元素需是 relative 定位，且宽高均为 100% -->
  <div v-show="detailVisible" class="wrapper">
    <section class="header">
      <span class="title">{{ curCardCode }}</span>
      <div class="center">
        <div v-for="(item, index) in titleDataInfo" :key="index" class="c-flex-ycenter c-mr10">
          <label class="c-label-color c-mr3">{{ item.title }}:</label>
          <span class="c-highlight-color">{{ item.text }}</span>
        </div>
      </div>
      <div class="c-relative">
        <Icon name="btn-attachment" color="#cdcdcd" size="15" class="c-cursor-p c-mr20" @click="openFilesDialog" />
        <span class="c-absolute" style="color: red; top: -8px; left: 12px">{{ numberFormat(titleData?.reconciliationCount, true) }}</span>
      </div>
      <Icon v-if="false" class="close" name="btn-close" size="14" color="var(--tc-primary-text)" :click="closeDialog" />
    </section>
    <section class="content">
      <div class="c-flex-column c-h100p c-w100p">
        <div class="c-relative c-flex-between">
          <div class="c-flex-between c-w100p">
            <div class="c-flex-ycenter">
              <c-search filterName="customerReceivableDetail" v-model:data="queryList" :config="queryConfig" />
              <el-checkbox v-model="isShowAllOrder" label="显示所有订单" class="c-ml5 c-mb3" @change="onSearch('init')" />
            </div>
            <Icon name="btn-remark" color="var(--tc-global-gray)" size="13" class="c-cursor-p c-mr35 c-mb7" @click="addBatchRemark" />
          </div>
          <c-column-filter v-model:data="columns" dialogTable="_customerReceivableDetail" />
        </div>
        <c-ag-table
          ref="agTable"
          :config="tableConfig"
          :data="tableData"
          :columns="columns"
          :loading="tableLoading"
          v-model:selectedInfo="selectedInfo"
          @scrollToEnd="onSearch('addData')"
          @customServerSort="serverSortHandler"
          class="c-flex-1"
        />
        <c-footer v-model:data="footerData" :options="footerOptions" @update="footerHandler" />
      </div>
    </section>
    <section class="footer">
      <template v-for="(item, index) in btnOption">
        <el-button v-if="item.show" :key="index" :type="item?.type" @click="item.click" :loading="item?.loading" class="c-mx60">
          <Icon v-show="!item?.loading" :name="item.iconName" size="13" class="c-mr4" :class="item.iconClass" />
          <span>{{ item.text }}</span>
        </el-button>
      </template>
    </section>
    <RemarkDrawer ref="remarkDrawer" @updateRowData="updateRowData" />
    <UploadDialog ref="uploadDialog" @success="initSearch" />
    <ClientReconciliationDialog ref="clientReconciliationDialog" />
  </div>
</template>

<script lang="tsx" setup>
import { shallowRef, computed, useTemplateRef, defineComponent, watch } from 'vue'
import { numberFormat } from '@/utils/format'
import { GetClientDueDetailHeader, GetClientDueDetailList } from '../request'
import DetailChildTable from './DetailChildTable.vue'
import type { ValueFormatterParams, CellClassParams } from 'ag-grid-community'
import type { DetailRowData, DetailTitleData } from '../types'
import { jsonToExcelHandler, transformToExcelData } from '@/hooks/useExcel'
import { runWithLoadingState } from '@/utils/common'
import Icon from '@/components/global/dynamicImport/icon/index.vue'
import RemarkDrawer from '@/views/finance/common/components/RemarkDrawer.vue'
import { postMessage } from '@/hooks/useMessage'
import { canInterReconMap, sboIdMap } from '@/views/finance/common/js/map'
import LinkUser from '@/components/global/dynamicImport/linkUser/index.vue'
import { ElMessage } from 'element-plus'
import UploadDialog, { type UploadOption } from '@/components/uploadDialog/index.vue'
import ClientReconciliationDialog from '@/views/finance/common/components/ClientReconciliationDialog.vue'
import { setIndicatorList } from '@/utils/setIndicatorList'

// 页头
const titleData = shallowRef<DetailTitleData | null>(null)
const titleDataInfo = computed(() => {
  const {
    cardName,
    actualSaleAmount,
    billReceivableAmount,
    billTotalAmount,
    contractAmount,
    creditTotalAmount,
    deliveryAmount,
    overDueAmount,
    overDuePercent,
    receivableInvoiceAmount,
    receivablePercent,
    receiveAmount
  } = titleData.value ?? {}
  return [
    { title: '业务伙伴名称', text: cardName },
    { title: '合同金额', text: numberFormat(contractAmount) },
    { title: '交货总额', text: numberFormat(deliveryAmount) },
    { title: '收款总额', text: numberFormat(receiveAmount) },
    { title: '实际销售总额', text: numberFormat(actualSaleAmount) },
    { title: '应收总额', text: numberFormat(receivableInvoiceAmount) },
    { title: '应收占比', text: receivablePercent },
    { title: '逾期应收', text: numberFormat(overDueAmount) },
    { title: '逾期占比', text: overDuePercent },
    { title: '开票总额', text: numberFormat(billTotalAmount) },
    { title: '开票应收', text: numberFormat(billReceivableAmount) },
    { title: '退货金额', text: numberFormat(creditTotalAmount) }
  ]
})
const clientReconciliationDialog = useTemplateRef<DialogInstance | null>('clientReconciliationDialog')
function openFilesDialog() {
  clientReconciliationDialog.value!.openDialog({ cardCode: curCardCode })
}

// 搜索栏
const orderStatusAttrsList: SelectList[] = [
  { value: 99, label: '全部', style: { color: 'var(--tc-global-gray)' } },
  { value: 3, label: '未清', style: { color: '#E9730C' } },
  { value: 4, label: '未清-已打印', style: { color: '#E9730C' } },
  { value: 5, label: '已清', style: { color: 'var(--tc-global-green)' } },
  { value: 6, label: '已取消', style: { color: 'var(--tc-global-gray)' } }
]
const indicatorList = shallowRef<SelectList[]>([])
const isShowAllOrder = shallowRef<boolean>(false)
const queryList = shallowRef<QueryList>({
  orderReceivePercentRange: [],
  sortOrder: 'desc', // desc 降序，asc 升序
  sortName: 'orderCreateTime'
})
const queryConfig = computed(() => {
  const orderStatusAttrs = { clearable: true, placeholder: '单据状态', optionV2: orderStatusAttrsList }
  const indicatorAttrs = { clearable: true, placeholder: '标识', optionV2: indicatorList, multiple: true }
  return [
    { prop: 'salesMan', name: 'input', attr: { placeholder: '销售员' }, on: { change: initSearch } },
    { prop: 'saleOrder', name: 'input', attr: { placeholder: '销售订单号' }, on: { change: initSearch } },
    { prop: 'indicatorList', name: 'select', attr: indicatorAttrs },
    { prop: 'orderStatus', name: 'select', attr: orderStatusAttrs, on: { change: initSearch } },
    { prop: 'comment', name: 'input', attr: { placeholder: '备注' }, on: { change: initSearch } },
    { prop: 'orderReceivePercentRange', name: 'textPicker', attr: { suffix: '%', title: '应收占比' }, filter: true },
    { text: '查询', name: 'button', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: initSearch } },
    { text: '对账单', name: 'button', attr: { type: 'primary', iconName: 'btn-export-table' }, on: { click: exportTable } },
    { text: '上传', name: 'button', attr: { type: 'primary', iconName: 'btn-upload' }, on: { click: uploadFile } }
  ]
})
const agTable = useTemplateRef<AgGridInstance | null>('agTable')
function exportTable() {
  const tableData = agTable.value!.instance.getRowData()
  const excelData = transformToExcelData({ data: tableData, columns: columns.value, isNeedIndex: true })
  jsonToExcelHandler(excelData, '客户应收详情页.xls')
}
const uploadDialog = useTemplateRef<DialogInstance<UploadOption> | null>('uploadDialog')
function uploadFile() {
  const { selectedData } = selectedInfo.value
  if (selectedData.length === 0) {
    ElMessage({ type: 'warning', message: '请选择单据' })
  } else {
    const saleOrders = selectedData.map((i) => ({ orderId: i.saleOrder, sboId: i.sboId }))
    uploadDialog.value!.openDialog({
      url: '/Finance/SalesInvoice/AddClientReconciliation',
      data: { model: { saleOrders, cardCode: curCardCode } } // 附加回传参数
    })
  }
}

// 表格
let curCardCode = ''
const currentPageIndex = shallowRef<number>(1)
const pageLimit = shallowRef<number>(200)
const defaultTableConfig: AgTableConfig = {
  lazyEnable: false, // 懒加载
  serverSortEnable: true, // 服务端排序
  attr: {
    fullWidthCellRenderer: DetailChildTable, // 跨网格行组件
    context: {
      fullWidthRowHeight: 130, // 跨网格行组件高度
      isDefaultExpandAllFullWidthRow: false, // 是否默认展开跨网格行组件
      isDefaultExpandTreeData: false // 是否默认展开所有树形数据
    }
  }
}
let tableConfig = { ...defaultTableConfig }
const tableLoading = shallowRef<boolean>(false)
const selectedInfo = shallowRef<AgSelectedInfo<DetailRowData>>({ isSelectAll: false, selectedData: [] })
const tableData = shallowRef<DetailRowData[]>([])
const pcntFormatter = (params: ValueFormatterParams) => {
  return params.value ? numberFormat(params.value, true) + '%' : ''
}
const orderReceiveInvoiceAmountStyle = (params: CellClassParams) => {
  return {
    color:
      new Map([
        [params.value > 0, 'var(--tc-global-red)'],
        [params.value === 0, ''],
        [params.value < 0, 'var(--tc-global-green)']
      ]).get(true) ?? ''
  }
}
const orderReceivePercentStyle = (params: CellClassParams) => {
  return {
    color:
      new Map([
        [params.value <= 30, 'var(--tc-global-green)'],
        [params.value > 30 && params.value < 60, 'var(--tc-global-yellow)'],
        [params.value >= 60, 'var(--tc-global-red)']
      ]).get(true) ?? ''
  }
}
const remarkDrawer = useTemplateRef<{ openDrawer: Function }>('remarkDrawer')
const saleOrderComp = defineComponent({
  props: { params: { type: Object as AgParams<DetailRowData>, required: true } },
  setup(props) {
    const { saleOrder, canInterRecon, hasClientReconciliation, sboId, accepted } = props.params.data!
    const { statusColor, statusTag } = canInterReconMap[canInterRecon] ?? {}
    const { fromColor, fromTag } = sboIdMap[sboId] ?? []
    const openDetail = () => postMessage('openSaleOrderDetail', { docEntry: saleOrder })
    const openFileDailog = () => clientReconciliationDialog.value!.openDialog({ orderId: saleOrder, sboId })
    const textStyle = { color: accepted === 'Y' ? 'var(--tc-global-green)' : 'var(--tc-primary-text)' }
    return () => (
      <div class="c-flex-ycenter">
        <Icon name="arrow" color="var(--tc-brand)" size="12" class="c-mr2 c-mb1 c-cursor-p" click={openDetail} stop={true} />
        <span style={textStyle}>{'SE-' + saleOrder}</span>
        <span class="c-fs12" style={`scale:0.65;color:${statusColor}`}>
          {statusTag}
        </span>
        <span class="c-fs12" style={`scale:0.65;color:${fromColor}`}>
          {fromTag}
        </span>
        {hasClientReconciliation && <Icon name="btn-attachment" color="#cdcdcd" size="12" class="c-ml2 c-cursor-p" click={openFileDailog} />}
      </div>
    )
  }
})
const remarkComp = defineComponent({
  props: { params: { type: Object as AgParams<DetailRowData>, required: true } },
  setup(props) {
    const { hasRemark, saleOrder, sboId } = props.params.data!
    const iconColor = hasRemark ? 'var(--tc-global-yellow)' : 'var(--tc-global-gray)'
    const openDrawer = async () =>
      await remarkDrawer.value!.openDrawer({ rowData: [props.params.data], queryOrder: [{ docEntry: saleOrder, sboId }] })
    const newOpenDrawer = runWithLoadingState(openDrawer, tableLoading) // 加上 loading 效果
    return () => <Icon name="btn-remark" color={iconColor} size="13" class="c-cursor-p c-mt3" click={newOpenDrawer} />
  }
})
const slpNameComp = defineComponent({
  props: { params: { type: Object as AgParams<DetailRowData>, required: true } },
  setup(props) {
    const { salesManId, userType, salesMan } = props.params.data!
    return () => <LinkUser type={userType} userId={salesManId} text={salesMan} />
  }
})
const columns = shallowRef<AgColumnConfig[]>([
  { compName: 'fullWidthRowExpand', pinned: 'left', width: 30 },
  { type: 'checked', pinned: 'left' },
  { type: 'index', pinned: 'left' },
  { headerName: '销售订单号', field: 'saleOrder', width: 110, pinned: true, sortable2: 'custom', cellRenderer: saleOrderComp },
  { headerName: '标识', field: 'indicatorName', width: 65, pinned: true, sortable2: 'custom' },
  { headerName: '更新日期', field: 'updateTime', width: 80, formatType: 'date', pinned: true, sortable2: 'custom' },
  { headerName: '币种', field: 'orderDocCur', width: 50 },
  { headerName: '销售员', field: 'salesMan', width: 120, sortable2: 'custom', cellRenderer: slpNameComp },
  { headerName: '订单创建日期', field: 'orderCreateTime', width: 90, formatType: 'date' },
  { headerName: '合同金额', field: 'contractAmount', width: 90, formatType: 'price', context: { emptyValue: '-' } },
  { headerName: '实际销售金额', field: 'actualSaleAmount', width: 90, formatType: 'price', context: { emptyValue: '-' } },
  { headerName: '退货总金额', field: 'creditTotalAmount', width: 90, formatType: 'price', context: { emptyValue: '-' } },
  { headerName: '交货总金额', field: 'deliveryTotalAmount', width: 90, formatType: 'price', context: { emptyValue: '-' } },
  { headerName: '交货占比', field: 'deliveryAmountPercent', width: 60, valueFormatter: pcntFormatter, align: 'right' },
  { headerName: '已开票金额', field: 'billAmount', width: 90, formatType: 'price', context: { emptyValue: '-' } },
  { headerName: '开票比例', field: 'billAmountPercent', width: 60, valueFormatter: pcntFormatter, align: 'right' },
  { headerName: '收款总金额', field: 'receiveAmount', width: 90, formatType: 'price', context: { emptyValue: '-' } },
  { headerName: '收款占比', field: 'receiveMoneyPercent', width: 60, valueFormatter: pcntFormatter, align: 'right' },
  {
    headerName: '订单应收账款',
    field: 'orderReceiveInvoiceAmount',
    width: 100,
    formatType: 'price',
    context: { emptyValue: '-' },
    sortable2: 'custom',
    cellStyle: orderReceiveInvoiceAmountStyle
  },
  {
    headerName: '比例',
    field: 'orderReceivePercent',
    width: 80,
    sortable2: 'custom',
    align: 'right',
    valueFormatter: pcntFormatter,
    cellStyle: orderReceivePercentStyle
  },
  { headerName: '逾期应收', field: 'overDueAmount', width: 60, formatType: 'price', context: { emptyValue: '-' } },
  {
    headerName: '逾期占比',
    field: 'overDuePercent',
    width: 60,
    valueFormatter: pcntFormatter,
    cellStyle: { color: 'var(--tc-global-red)' },
    align: 'right'
  },
  { headerName: '逾期天数', field: 'overDueDays', width: 60, align: 'right' },
  { headerName: '开票应收金额', field: 'billReceiveAmount', width: 100, formatType: 'price', context: { emptyValue: '-' } },
  { headerName: '开票应收占比', field: 'billReceivePercent', width: 90, valueFormatter: pcntFormatter, align: 'right' },
  { headerName: '付款条件', field: 'paymentRule', width: 150 },
  { headerName: '客户参考编号', field: 'customerRefCode', width: 100 },
  { headerName: '已关闭物料金额', field: 'closeItemAmount', width: 100, formatType: 'price', context: { emptyValue: '-' } },
  { headerName: '单据状态', field: 'orderStatusName', width: 80 },
  { headerName: '备注', field: 'comment', width: 150 },
  { headerName: '备注操作', field: 'remark', width: 70, cellRenderer: remarkComp }
])
// 更新表格行数据
function updateRowData(rowData: DetailRowData[]) {
  rowData.forEach((item) => {
    const rowNode = agTable.value!.getRowNode(item.id) // 根据唯一标识 id 匹配
    rowNode.updateData(item) // 更新行数据
    agTable.value!.gridApi.refreshCells({ force: true, rowNodes: [rowNode] }) // 强行刷新行
  })
}
// 添加批量备注
function addBatchRemark() {
  const { selectedData } = selectedInfo.value
  if (selectedData.length === 0) {
    ElMessage({ type: 'warning', message: '请选择单据' })
  } else {
    const queryOrder = selectedData.map((i) => ({ docEntry: i.saleOrder, sboId: i.sboId }))
    remarkDrawer.value!.openDrawer({ rowData: selectedData, queryOrder, isBatch: true })
  }
}
// 服务端排序
function serverSortHandler({ colId, sort }: AgSortParams) {
  queryList.value = { ...queryList.value, sortOrder: sort, sortName: colId }
  onSearch('pagination')
}

// 页脚
const extraInfo = shallowRef({ count: 0, sum: {} })
const footerData = shallowRef<FooterData>({ page: 1, limit: 200, time: [] })
const totalAmtMap = [
  { label: '合同', key: 'contractAmount' },
  { label: '交货', key: 'deliveryTotalAmount' },
  { label: '开票', key: 'billAmount' },
  { label: '应收', key: 'orderReceiveInvoiceAmount' }
]
const footerOptions = computed<FooterOptions>(() => {
  const { count, sum } = extraInfo.value
  const { isSelectAll, selectedData } = selectedInfo.value
  const selectData = isSelectAll ? getSumData(sum) : selectedData
  return {
    baseOption: { totalCount: count, isSelectAll, selectData },
    compOption: [{ name: 'pagination' }, { name: 'datePicker' }, { name: 'totalAmt', totalAmtOption: { totalMap: totalAmtMap } }]
  }
})
function getSumData(sum: Record<string, number>) {
  return [
    {
      contractAmount: sum.orderAmt_Sum, // 合同金额总计
      deliveryTotalAmount: sum.deliveryAmt_Sum, // 交货金额总计
      billAmount: sum.billAmt_Sum, // 开票总额
      orderReceiveInvoiceAmount: sum.invoiceBal_Sum, // 应收金额总计
      overDueAmount: sum.overDueAmt_Sum, // 逾期金额总计
      receiveAmount: sum.receiptAmt_Sum // 收款金额总计
    }
  ]
}

function footerHandler(event: FooterUpdateEvent) {
  const { key, page, limit, isSelectAll } = event
  if (key === 'pagination') {
    if (isSelectAll) {
      currentPageIndex.value = 1
      pageLimit.value = 20000
      // !tableConfig.lazyEnable && (tableConfig.lazyEnable = true)
    } else {
      page && (currentPageIndex.value = page)
      limit && (pageLimit.value = limit)
      tableConfig.lazyEnable && (tableConfig.lazyEnable = false)
    }
  }
  onSearch('pagination')
}

// 底部按钮
const btnOption = computed(() => {
  return [{ text: '取消', type: '', loading: false, show: true, click: closeDialog, iconName: 'btn-close', iconClass: 'c-mb1' }]
})

// 打开或关闭弹窗
interface DetailParams {
  cardCode: string
  oidcinfo?: SelectList[]
}
const detailVisible = shallowRef<boolean>(false)
const closeDialog = () => (detailVisible.value = false)
const openDialog = (params: DetailParams) => {
  // 恢复默认值
  const { cardCode } = params
  curCardCode = cardCode
  detailVisible.value = true
  isShowAllOrder.value = false
  tableData.value = []
  tableConfig = defaultTableConfig
  pageLimit.value = 200
  currentPageIndex.value = 1
  setIndicatorList(indicatorList)
  getOrderTitleData() // 获取页头数据
  initSearch() // 获取表格数据
}
async function getOrderTitleData() {
  const res = await GetClientDueDetailHeader({ cardCode: curCardCode })
  const { code, result } = res
  if (code === 200) {
    titleData.value = result ?? {}
  }
}
function initSearch() {
  onSearch('init')
}
type SearchVerifyInfo = 'init' | 'addData' | 'pagination'
async function onSearch(verifyInfo: SearchVerifyInfo) {
  try {
    tableLoading.value = true
    const params = {
      ...queryList.value,
      cardCode: curCardCode,
      isShowAllOrder: isShowAllOrder.value,
      page: currentPageIndex.value,
      limit: pageLimit.value
    }
    verifyInfo === 'init' && (currentPageIndex.value = 1)
    verifyInfo === 'addData' && currentPageIndex.value++
    const res = await GetClientDueDetailList(params)
    const { code, data, count, extraData } = res
    extraInfo.value = { count, sum: extraData }
    if (code === 200) {
      const callback = new Map([
        [verifyInfo === 'addData', () => agTable.value!.applyTransaction(data)],
        [['init', 'pagination'].includes(verifyInfo), () => (tableData.value = data)]
      ]).get(true)
      callback && callback()
    }
  } finally {
    tableLoading.value = false
  }
}

// 跨系统关闭详情页，如在 BI 通过 iframe 打开该详情页时
const emit = defineEmits(['closeIframe'])
watch(detailVisible, () => detailVisible.value || emit('closeIframe'))

defineExpose({ openDialog })
</script>

<style scoped lang="scss">
@import '@/styles/page-detail.scss';
@include pageDetail;
</style>
