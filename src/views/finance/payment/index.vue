<template>
  <div class="c-relative">
    <div class="c-flex-column c-h100p">
      <div class="c-relative c-flex-between">
        <c-search v-model:data="queryList" :config="searchConfig" />
        <c-column-filter v-model:data="columnsConfig" :right="0" />
      </div>
      <c-table v-model:data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1" v-loading="loading">
        <template #applicantName="{ row }">
          <LinkUser :type="row.userType" :userId="row.applicantId" :text="row.applicantName" />
        </template>
        <template #progressBarNodeList="{ row2 }">
          <ProgressBar :data="row2.progressBarNodeList" />
        </template>
        <template #amountPrice="{ row }">
          <span>{{ formatPrice(row.amount) }}</span>
          <span class="spanChild c-mb2 el-input__suffix">{{ row.currency }}</span>
        </template>
      </c-table>
      <c-footer v-model:data="footerData" :options="footerOptions" @update="onSearch" />
      <PrintDialog ref="printDialog" />
      <SumDialog ref="sumDialog" />
      <RefundMoneyDetail ref="refundMoneyDetail" />
    </div>
  </div>
</template>

<script lang="tsx" setup>
import { numberFormat2 } from '@/utils/format'
import { shallowRef, computed, provide, useTemplateRef, onMounted, nextTick } from 'vue'
import { useMessage, postMessage } from '@/hooks/useMessage'
import { keepAliveOption } from '@/utils/generateRoutes'
import { ElMessage } from 'element-plus'
import type { RowData } from '@/views/finance/payment/types'
import SumDialog from './components/SumDialog.vue'
import PrintDialog from './components/PrintDialog.vue'
import { Load, BatchPaymentPrint, PaymentReject } from './request'
import { setIndicatorList } from '@/utils/setIndicatorList'
import ProgressBar from '@/components/progressBar/index.vue'
import RefundMoneyDetail from '@/views/finance/acceptPaybacks/components/RefundMoneyDetail.vue'

// keep-alive
defineOptions({ name: keepAliveOption.payment })

// postMessage
useMessage('payment')

// 页面数据初始化
onMounted(() => {
  onSearch()
  setIndicatorList(indicatorList)
})

// 根据 type 打开 BI 详情页
const docTypeList: SelectList[] = [
  { value: 1, label: '采购付款', detailKey: 'purchasePaymentsDetail' },
  { value: 2, label: '报销单', detailKey: 'reimburseDetail' },
  { value: 3, label: '服务提成', detailKey: 'serviceCommissionDetail' },
  { value: 4, label: '投标保证金', detailKey: 'bidBondDetail' },
  { value: 5, label: '借款', detailKey: 'borrowMoneyDetail' },
  { value: 6, label: '退款', detailKey: 'backMoneyDetail' }
]
const refundMoneyDetail = useTemplateRef<DialogInstance | null>('refundMoneyDetail')
const openBIDetailByType = ({ row }: Record<string, RowData>) => {
  const { type, detail, approvalNumber } = row
  const item = docTypeList.find((i) => i.value === type)
  if (item) {
    const { detailKey, label } = item
    if (detailKey === 'backMoneyDetail') {
      refundMoneyDetail.value!.openDialog({ isAdd: false, id: approvalNumber })
    } else {
      const { outsourcId, outsourcStatusName, purchaseOrderId, purchaseSourceNumber, reimburseFromOrderId, reimburseFromOrderType, reimburseId } =
        detail
      const dataMap: Record<string, Object> = {
        purchasePaymentsDetail: { paymentId: purchaseOrderId, sourceNumber: purchaseSourceNumber },
        reimburseDetail: { id: reimburseId, fromId: reimburseFromOrderId, fromType: reimburseFromOrderType },
        serviceCommissionDetail: { id: outsourcId, statusName: outsourcStatusName }
      }
      const data = dataMap[detailKey] ?? null
      if (data) {
        postMessage(detailKey, data)
      } else {
        ElMessage({ type: 'warning', message: `暂不支持打开${label}详情页` })
      }
    }
  }
}

// 注入到子组件，用于提交完成后重新加载数据
provide('updateRootData', onSearch)

const queryList = shallowRef<QueryList>({
  status: 1,
  indicator: '',
  sortName: 'updateTime',
  sortOrder: 'desc' // desc升序，asc升序
})
const indicatorList = shallowRef<SelectList[]>([])
const totalCount = shallowRef<number>(0)
const footerData = shallowRef<FooterData>({ page: 1, limit: 200, time: [] })
const footerOptions = computed<FooterOptions>(() => {
  return {
    baseOption: { totalCount: totalCount.value },
    compOption: [{ name: 'pagination' }, { name: 'datePicker' }]
  }
})
const loading = shallowRef<boolean>(false)
const tableData = shallowRef<RowData[]>([])
const selectData = shallowRef<RowData[]>([])
const statusList: SelectList[] = [
  { value: 1, label: '待支付' },
  { value: 2, label: '处理中' },
  { value: 3, label: '已支付' }
]

const btnLoading1 = shallowRef<boolean>(false)
const btnLoading2 = shallowRef<boolean>(false)
const btnLoading3 = shallowRef<boolean>(false)
const searchConfig = computed(() => [
  { name: 'select', prop: 'indicator', attr: { optionV2: indicatorList, placeholder: '标识' }, on: { change: initSearch } },
  { name: 'input', prop: 'approvalNum', attr: { placeholder: '审批号/单据号' }, on: { change: initSearch } },
  { name: 'input', prop: 'sourceCode', attr: { placeholder: '来源单号' }, on: { change: initSearch } },
  { name: 'input', prop: 'saleMan', attr: { placeholder: '部门/申请人' }, on: { change: initSearch } },
  { name: 'select', prop: 'docType', attr: { optionV2: docTypeList, placeholder: '单据类型' }, on: { change: initSearch } },
  { name: 'select', prop: 'status', attr: { optionV2: statusList, placeholder: '状态' }, on: { change: initSearch } },
  { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: initSearch } },
  { name: 'button', text: '打印', attr: { type: 'primary', iconName: 'btn-print', loading: btnLoading1.value }, on: { click: printHandler } },
  { name: 'button', text: '付款', attr: { type: 'primary', iconName: 'btn-pay-money', loading: btnLoading2.value }, on: { click: openSumDialog } },
  { name: 'button', text: '驳回', attr: { type: 'primary', iconName: 'btn-reject-order', loading: btnLoading3.value }, on: { click: rejectOrders } }
])

const sumDialog = useTemplateRef<DialogInstance>('sumDialog')
const printDialog = useTemplateRef<DialogInstance>('printDialog')
async function printHandler() {
  btnLoading1.value = true
  const sData = selectData.value
  const map = new Map([
    [sData.length === 0, '请选择付款单据'],
    [sData.some((i) => i.statusName !== '处理中'), '只能选择状态为处理中的单据']
  ])
  const message = map.get(true)
  if (message) {
    btnLoading1.value = false
    ElMessage({ type: 'warning', message })
  } else {
    try {
      const params = { paymentIds: sData.map((i) => i.id), isReprint: true }
      const res = await BatchPaymentPrint(params)
      const url = URL.createObjectURL(res)
      await nextTick()
      window.open(url)
    } catch (error) {
      Promise.reject(`打印失败${error}`)
    } finally {
      btnLoading1.value = false
    }
  }
}
async function openSumDialog() {
  btnLoading2.value = true
  const sData = selectData.value
  const map = new Map([
    [sData.length === 0, '请选择付款单据'],
    [new Set(sData.map((i) => i.typeName)).size > 1, '只能选择同一来源的单据'],
    [new Set(sData.map((i) => i.indicator)).size > 1, '只能选择同一标识的单据']
    // [sData.some((i) => !i.receiveAccount || i.receiveAccount === '-'), '收款方账户不能为空']
  ])
  const message = map.get(true)
  if (message) {
    btnLoading2.value = false
    ElMessage({ type: 'warning', message })
  } else {
    try {
      const paymentIds = sData.map((i) => i.id)
      await sumDialog.value!.openDialog({ paymentIds })
    } finally {
      btnLoading2.value = false
    }
  }
}
function rejectOrders() {
  btnLoading3.value = true
  const sData = selectData.value
  const map = new Map([[sData.length === 0, '请选择付款单据']])
  const message = map.get(true)
  if (message) {
    btnLoading3.value = false
    ElMessage({ type: 'warning', message })
  } else {
    PaymentReject({ paymentIds: sData.map((i) => i.id) })
      .then((res) => {
        if (res.code === 200) {
          ElMessage({ type: 'success', message: '操作成功' })
          onSearch()
        }
      })
      .finally(() => {
        btnLoading3.value = false
      })
  }
}

const updateSelect = (value: RowData[]) => (selectData.value = value)
const tableConfig = {
  height: '100%',
  width: '100%',
  'default-sort': { prop: 'updateTime', order: 'descending' },
  on: { 'selection-change': updateSelect, 'sort-change': sortChangeHandler }
}
const columnsConfig = shallowRef([
  { type: 'selection', fixed: true },
  { slotName: 'index', fixed: true },
  { label: '审批序号', prop: 'approvalNumber', width: '100', slotName: 'addArrow', slotOn: { click: openBIDetailByType }, sortable: 'custom' },
  { label: '单据来源', prop: 'typeName', width: '70' },
  { label: '单据金额', prop: 'amount', width: '110', slotName: 'amountPrice', sortable: 'custom', align: 'right' },
  { label: '收款方名称', prop: 'receiveAccountName', width: '200' },
  { label: '收款方账户', prop: 'receiveAccount', width: '170' },
  { label: '开户行名称', prop: 'bankName', width: '200' },
  { label: '申请人', prop: 'applicantName', width: '120', slotName: 'applicantName', sortable: 'custom' },
  { label: '标识', prop: 'indicatorName', width: '80' },
  { label: '更新时间', prop: 'updateTime', width: '150', sortable: 'custom' },
  { label: '状态', prop: 'statusName', width: '70' },
  { label: '进度', prop: 'progressBarNodeList', width: '65', slotName: 'progressBarNodeList' }
])
const formatPrice = (price: number) => {
  const amountPrice = numberFormat2({
    value: price,
    isInteger: false,
    min: 2,
    max: 2
  })
  return amountPrice
}
function sortChangeHandler(data: any) {
  const { prop, order } = data
  if (order !== null) {
    const sortOrder = order === 'ascending' ? 'asc' : 'desc'
    queryList.value = { ...queryList.value, sortName: prop, sortOrder }
    onSearch()
  }
}

const initSearch = () => {
  footerData.value = { ...footerData.value, page: 1 }
  onSearch()
}
function onSearch() {
  loading.value = true
  const { page, limit } = footerData.value
  const params = { ...queryList.value, page, limit }
  Load(params)
    .then((res) => {
      const { code, data, count } = res
      if (code === 200) {
        tableData.value = data
        totalCount.value = count
      }
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
<style>
.spanChild {
  margin-left: 8px;
}
</style>
