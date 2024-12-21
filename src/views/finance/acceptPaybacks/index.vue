<template>
  <div class="c-relative">
    <div class="c-flex-column c-h100p">
      <div class="c-relative c-flex-between">
        <c-search v-model:data="queryList" :config="searchConfig" />
        <c-column-filter v-model:data="columnsConfig" :right="0" />
      </div>
      <c-table v-model:data="tableData" :tableConfig="tableConfig" :columnsConfig="newColumnsConfig" class="c-flex-1" v-loading="loading">
        <template #receiptStr="{ column, index }">
          <span class="day-header-num">{{ index }}</span>
          <span>{{ column.label }}</span>
        </template>
        <template #refundStr="{ column, index }">
          <span class="day-header-num">{{ index }}</span>
          <span>{{ column.label }}</span>
        </template>
        <template #progressBar="{ row }">
          <PercentBar :info="getPBOption(row)" />
        </template>
        <template #saleMan="{ row }">
          <LinkUser :type="row.userType" :userId="row.saleManId" :text="row.saleMan" />
        </template>
        <template #cardCode="{ row }">
          <div class="c-flex-ycenter">
            <Icon name="arrow" color="var(--tc-brand)" size="12" class="c-mr2 c-mb1 c-cursor-p" />
            <span>{{ row.cardCode }}</span>
            <CustomerIcons :data="row.clientInfo" />
          </div>
        </template>
      </c-table>
      <c-footer v-model:data="footerData" :options="footerOptions" @update="onSearch" />
    </div>
    <PayDetailDialog ref="payDetailDialog" @search="initSearch" />
    <RefundMoneyDetail ref="refundMoneyDetail" @search="initSearch" />
  </div>
</template>

<script setup lang="tsx">
import { shallowRef, computed, reactive, useTemplateRef, onMounted, nextTick } from 'vue'
import { useMessage, postMessage } from '@/hooks/useMessage'
import { ReceiptLoad, GetDropDownOptions } from './request'
import { requestList } from '@/utils/requestList'
import type { RowData } from './types'
import { ElMessage } from 'element-plus'
import { numberFormat } from '@/utils/format'
import { keepAliveOption } from '@/utils/generateRoutes'
import PayDetailDialog from './components/PayDetailDialog.vue'
import CustomerIcons from '@/components/customerIcons/index.vue'
import Icon from '@/components/global/dynamicImport/icon/index.vue'
import PercentBar, { type PercentBarInfo } from '@/components/percentBar/index.vue'
import { setIndicatorList } from '@/utils/setIndicatorList'
import RefundMoneyDetail from './components/RefundMoneyDetail.vue'
import { authStore } from '@/stores/auth'

// keep-alive
defineOptions({ name: keepAliveOption.acceptPaybacks })

// postMessage
useMessage('acceptPaybacks')

// 打开销售订单详情页
const openSaleDetail = ({ row }: TableEvenParams<RowData>) => {
  postMessage('openSaleOrderDetail', { docEntry: row.saleDocEntry })
}

// 获取用户角色信息
const userRoles: string[] | null = authStore.userInfo?.roles

// 页面数据初始化
onMounted(() => {
  const refundStatus = userRoles?.includes('退款审批人') ? refundStatusMap.pending : refundStatusMap.all
  queryList.value = { ...queryList.value, refundStatus }
  initSearch()
  requestList(GetDropDownOptions, statusList)
  setIndicatorList(indicatorList)
})

// 展示所有或者部分收款/退款金额配置
interface ColumnShowOption {
  isShowAll?: boolean // 是否展示所有列
  maxLengthOfReceipt: number // 收款金额列最大长度
  maxLengthOfRefund: number // 退款金额列最大长度
}
const columnShowOption = reactive<ColumnShowOption>({ maxLengthOfReceipt: 0, maxLengthOfRefund: 0, isShowAll: false })
const toggleColumnShow = () => Object.assign(columnShowOption, { ...columnShowOption, isShowAll: !columnShowOption.isShowAll })

// 搜索栏
const queryList = shallowRef<QueryList>({})
const indicatorList = shallowRef<SelectList[]>([])
const statusList = shallowRef<SelectList[]>([])
const refundStatusMap: Record<string, number> = { all: 0, approved: 1, pending: 2 }
const refundStatusList: SelectList[] = [
  { label: '全部', value: refundStatusMap.all },
  { label: '已批准', value: refundStatusMap.approved },
  { label: '未决', value: refundStatusMap.pending }
]
const isDev = () => ElMessage({ type: 'warning', message: '功能开发中' })
const searchConfig = computed(() => [
  { name: 'select', prop: 'refundStatus', attr: { optionV2: refundStatusList, placeholder: '订单状态' }, on: { change: initSearch } },
  { name: 'select', prop: 'indicatorList', attr: { optionV2: indicatorList, placeholder: '标识', multiple: true } },
  { name: 'input', prop: 'receiptDocEntry', attr: { placeholder: '收款单号' }, on: { change: initSearch } },
  { name: 'input', prop: 'saleDocEntry', attr: { placeholder: '销售订单号' }, on: { change: initSearch } },
  { name: 'input', prop: 'cardNameOrCode', attr: { placeholder: '客户代码/名称' }, on: { change: initSearch } },
  { name: 'input', prop: 'searchText', attr: { placeholder: '业务员' }, on: { change: initSearch } },
  { name: 'select', prop: 'status', attr: { optionV2: statusList, placeholder: '状态' }, on: { change: initSearch } },
  { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: initSearch } },
  { name: 'button', text: '修改', attr: { type: 'primary', iconName: 'btn-edit' }, on: { click: isDev } },
  { name: 'button', text: '退款', attr: { type: 'primary', iconName: 'btn-back-money' }, on: { click: openRefundMoneyDetailOfAdd } },
  {
    name: 'button',
    text: columnShowOption.isShowAll ? '展示部分列' : '展示所有列',
    attr: { type: 'primary', iconName: 'btn-show-column' },
    on: { click: toggleColumnShow },
    isShow: columnShowOption.maxLengthOfReceipt > 3 || columnShowOption.maxLengthOfRefund > 3
  }
])
const refundMoneyDetail = useTemplateRef<DialogInstance | null>('refundMoneyDetail')
// 新增阶段打开退款详情页
function openRefundMoneyDetailOfAdd() {
  const message = new Map([
    [selectData.value.length === 0, '请选择单据'],
    [selectData.value.length > 1, '只能选择一条单据']
  ]).get(true)
  if (message) {
    ElMessage({ type: 'warning', message })
  } else {
    refundMoneyDetail.value!.openDialog({ isAdd: true, id: selectData.value[0].saleDocEntry })
  }
}

// 表格
const loading = shallowRef<boolean>(false)
const tableData = shallowRef<RowData[]>([])
const selectData = shallowRef<RowData[]>([])
const tableConfig = {
  height: '100%',
  width: '100%',
  on: { 'selection-change': (value: RowData[]) => (selectData.value = value) }
  // 'default-sort': { prop: 'updateTime', order: 'descending' } // TODO: 和 ProgressBar 组件有冲突，待处理
}
const showIconHandler = ({ row, column }: TableEvenParams<RowData>) => {
  const index = Number(column?.prop?.replace('receiptStr', ''))
  const printed = row?.receiptDocEntrys![index]?.printed
  return printed === 'Y'
}
const columnKey = shallowRef<string[]>([])
const arrowTextStyle = ({ row }: TableEvenParams<RowData>) => ({
  color: row.accepted === 'Y' ? 'var(--tc-global-green)' : 'var(--tc-primary-text)'
})
const columnsConfig = computed<AnyObject[]>({
  get: () => {
    const result = [
      { type: 'selection', fixed: true },
      { slotName: 'index', fixed: true },
      {
        label: '审批序号',
        prop: 'globelApprovalId',
        width: '80',
        slotName: 'addArrow',
        slotParams: { format: { emptyText: '' } },
        slotOn: { click: openRefundMoneyDetail },
        fixed: true
      },
      {
        label: '销售订单号',
        prop: 'saleDocEntry',
        width: '90',
        slotName: 'addArrow',
        slotParams: { prefix: 'SE-', textStyle: arrowTextStyle },
        slotOn: { click: openSaleDetail },
        fixed: true
      },
      { label: '业务伙伴代码', prop: 'cardCode', width: '130', slotName: 'cardCode', fixed: true },
      { label: '业务伙伴名称', prop: 'cardName', width: '150', fixed: true },
      { label: '销售订单金额', prop: 'orderAmount', width: '90', slotName: 'price', slotParams: { format: { emptyText: '-' } } },
      { label: '交货金额', prop: 'receiptAmount', width: '90', slotName: 'price', slotParams: { format: { emptyText: '-' } } },
      { label: '应收余额', prop: 'receiptBalance', width: '90', slotName: 'price', slotParams: { format: { emptyText: '-' } } },
      { label: '币种', prop: 'docCur', width: '50', align: 'center' },
      ...generateDynamicColumns(), // 收款金额、退款金额（动态；多列）
      { label: '销售员', prop: 'saleMan', width: '120', slotName: 'saleMan' },
      { label: '标识', prop: 'indicatorName', width: '70' },
      { label: '更新时间', prop: 'updateTime', width: '130', slotName: 'datetime' },
      { label: '进度条', prop: 'progressBar', slotName: 'progressBar', width: '70' }
    ]
    if (columnKey.value.length === 0) {
      return result // 页面初始化时不筛选
    } else {
      return result.filter((i) => !i.prop || columnKey.value.includes(i.prop) || ['receiptStr', 'refundStr'].includes(i.headerSlotName))
    }
  },
  set: (newColumns) => {
    columnKey.value = newColumns.flatMap((i) => i.prop ?? [])
  }
})
const newColumnsConfig = computed(() => {
  return queryList.value.refundStatus !== refundStatusMap.pending
    ? columnsConfig.value.filter((i) => i.prop !== 'globelApprovalId')
    : columnsConfig.value
})
// 退款审批状态
const refundApprovalStatusMap = {
  approval: 0, // 审批中
  agree: 1, // 已通过
  reject: 2, // 驳回
  recall: 3 // 撤回
}
function generateDynamicColumns() {
  const dynamicColumns: AnyObject[] = []
  const { maxLengthOfReceipt, maxLengthOfRefund, isShowAll } = columnShowOption
  const receiptLength = Math.min(maxLengthOfReceipt, isShowAll ? maxLengthOfReceipt : 3)
  const refundLength = Math.min(maxLengthOfRefund, isShowAll ? maxLengthOfRefund : 3)
  const baseColumn = { prop: '', width: '130', slotName: 'addArrow', align: 'right' }
  for (let i = 0; i < receiptLength; i++) {
    const receiptColumn = {
      ...baseColumn,
      label: '收款金额',
      slotOn: { click: openPayDetail },
      slotParams: {
        layout: 'flexEnd',
        beforeIcons: [{ show: showIconHandler, name: 'btn-print', color: '#1D85ED' }]
      },
      headerSlotAttr: { index: 0 },
      headerSlotName: 'receiptStr'
    }
    receiptColumn.headerSlotAttr.index = i + 1
    receiptColumn.prop = `receiptStr${i}`
    dynamicColumns.push(receiptColumn)
  }
  for (let i = 0; i < refundLength; i++) {
    const refundColumn = {
      ...baseColumn,
      label: '退款金额',
      slotOn: { click: openRefundMoneyDetailOfApprove },
      slotParams: { layout: 'flexEnd', textStyle: refundTextStyle },
      headerSlotAttr: { index: 0 },
      headerSlotName: 'refundStr'
    }
    refundColumn.headerSlotAttr.index = i + 1
    refundColumn.prop = `refundStr${i}`
    dynamicColumns.push(refundColumn)
  }
  return dynamicColumns
}
function refundTextStyle({ row, column }: TableEvenParams<RowData>) {
  const index = Number(column?.prop?.replace('refundStr', ''))
  if (row.refundDocEntrys![index]) {
    const { status } = row.refundDocEntrys![index]
    const { approval, agree, reject, recall } = refundApprovalStatusMap
    const colorMap = new Map([
      [status === approval, 'var(--tc-global-darkblue)'],
      [status === agree, 'var(--tc-primary-text)'],
      [status === reject, 'var(--tc-global-red)'],
      [status === recall, 'var(--tc-global-yellow)']
    ])
    return { color: colorMap.get(true) ?? '' }
  }
}
const payDetailDialog = useTemplateRef<DialogInstance>('payDetailDialog')
async function openPayDetail({ row, column }: TableEvenParams<RowData>) {
  try {
    loading.value = true
    const index = Number(column?.prop?.replace('receiptStr', ''))
    const docEntry = row.receiptDocEntrys![index].receiptDocEntry
    await payDetailDialog.value!.openDialog(docEntry)
  } finally {
    loading.value = false
  }
}
// 审批阶段打开退款详情页
function openRefundMoneyDetailOfApprove({ row, column }: TableEvenParams<RowData>) {
  const index = Number(column?.prop?.replace('refundStr', ''))
  const { globelApprovalId } = row.refundDocEntrys![index]
  refundMoneyDetail.value!.openDialog({ isAdd: false, id: globelApprovalId })
}

// 打开正在审批中的退款详情页
function openRefundMoneyDetail({ row }: TableEvenParams<RowData>) {
  refundMoneyDetail.value!.openDialog({ isAdd: false, id: row.globelApprovalId })
}

// 生成进度条配置数据
function getPBOption(row: RowData) {
  const result: PercentBarInfo = { isHidden: true }
  if (row.orderAmount) {
    const receiptTotalAmt = row.receiptDocEntrys?.reduce((pre, next) => pre + Number(next.receiptAmount), 0) ?? 0
    result.num = Number(((receiptTotalAmt / row.orderAmount) * 100).toFixed(0))
    result.interColor = new Map([
      [result.num <= 60, 'var(--tc-progress-red)'],
      [result.num > 60 && result.num <= 90, 'var(--tc-progress-yellow)'],
      [result.num > 90, 'var(--tc-progress-green)']
    ]).get(true)
    result.outerColor = result.num <= 0 ? 'var(--tc-progress-red)' : ''
    result.isHidden = false
  }
  return result
}

// 获取表格数据
const initSearch = () => {
  footerData.value = { ...footerData.value, page: 1 }
  onSearch()
}
function onSearch() {
  loading.value = true
  const { page, limit } = footerData.value
  const tableParams = { ...queryList.value, page, limit }
  ReceiptLoad(tableParams)
    .then(async (res) => {
      const { code, data, count } = res
      if (code === 200) {
        tableData.value = await generateDynamicRowData(data)
        totalCount.value = count || 500
      }
    })
    .finally(() => (loading.value = false))
}
// 生成动态表格数据
interface ReceiptObject {
  docEntryStrArr: number[]
  printedArr: string[]
  receiptStrArr: string[]
}
interface RefundObject {
  globelApprovalIdStrArr: number[]
  refundStrArr: string[]
  statusArr: number[]
}
async function generateDynamicRowData(data: RowData) {
  // 拿到收款金额和退款金额最大列长度
  const { maxLengthOfReceipt, maxLengthOfRefund } = data.reduce(
    (pre: ColumnShowOption, next: RowData) => {
      const nextReceiptLength = next.receiptDocEntrys?.length ?? 0
      const nextRefundLength = next.refundDocEntrys?.length ?? 0
      return {
        maxLengthOfReceipt: Math.max(pre.maxLengthOfReceipt, nextReceiptLength),
        maxLengthOfRefund: Math.max(pre.maxLengthOfRefund, nextRefundLength)
      }
    },
    { maxLengthOfReceipt: 0, maxLengthOfRefund: 0 }
  )
  Object.assign(columnShowOption, { maxLengthOfReceipt, maxLengthOfRefund, isShowAll: false })
  await nextTick()
  // 返回动态生成的数据
  return data.map((item: RowData) => {
    const receiptObject: ReceiptObject = { docEntryStrArr: [], printedArr: [], receiptStrArr: [] }
    const refundObject: RefundObject = { globelApprovalIdStrArr: [], refundStrArr: [], statusArr: [] }
    const { docEntryStrArr, printedArr, receiptStrArr } =
      item.receiptDocEntrys?.reduce((pre, next) => {
        const receiptStr = next.receiptAmount ? numberFormat(next.receiptAmount) + ' ' + next.receiptDocCur : ''
        pre.docEntryStrArr.push(next.receiptDocEntry)
        pre.printedArr.push(next.printed)
        pre.receiptStrArr.push(receiptStr)
        return pre
      }, receiptObject) ?? receiptObject
    const { globelApprovalIdStrArr, refundStrArr, statusArr } =
      item.refundDocEntrys?.reduce((pre, next) => {
        const refundStr = next.applyAmount ? numberFormat(next.applyAmount) + ' ' + next.receiptDocCur : ''
        pre.globelApprovalIdStrArr.push(next.globelApprovalId)
        pre.statusArr.push(next.status)
        pre.refundStrArr.push(refundStr)
        return pre
      }, refundObject) ?? refundObject
    for (let index = 0; index < columnShowOption.maxLengthOfReceipt; index++) {
      item[`docEntryStr${index}`] = docEntryStrArr[index] ?? '' // 收款 id
      item[`receiptStr${index}`] = receiptStrArr[index] ?? '' // 收款列内容
      item[`printed${index}`] = printedArr[index] ?? '' // 收款打印标识
    }
    for (let index = 0; index < columnShowOption.maxLengthOfRefund; index++) {
      item[`globelApprovalIdStr${index}`] = globelApprovalIdStrArr[index] ?? '' // 审批序号 id
      item[`refundStr${index}`] = refundStrArr[index] ?? '' // 退款列内容
      item[`status${index}`] = statusArr[index] ?? '' // 退款审批状态
    }
    return item
  })
}

const totalMap = [
  { label: '订单', key: 'orderAmount' },
  { label: '交货', key: 'receiptAmount' },
  { label: '收款', key: 'totalReceiptAmount' },
  { label: '退款', key: 'totalRefundAmount' },
  { label: '应收', key: 'receiptBalance' }
]
const totalCount = shallowRef<number>(0)
const footerData = shallowRef<FooterData>({ page: 1, limit: 200, time: [] })
const footerOptions = computed<FooterOptions>(() => {
  return {
    baseOption: { totalCount: totalCount.value, selectData: selectData.value },
    compOption: [{ name: 'pagination' }, { name: 'datePicker' }, { name: 'totalAmt', totalAmtOption: { totalMap } }]
  }
})
</script>

<style scoped lang="scss">
.day-header-num {
  font-size: 12px;
  transform: scale(0.8);
  display: inline-block;
  width: 22px;
  height: 18px;
  text-align: center;
  line-height: 16px;
  border: 1px solid #cfcccc;
  margin-right: 2px;
  border-radius: 10px;
}
</style>
