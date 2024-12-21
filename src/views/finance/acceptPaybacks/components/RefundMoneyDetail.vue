<template>
  <!-- 父级元素需是 relative 定位，且宽高均为 100% -->
  <div v-show="detailVisible" class="wrapper">
    <section class="header">
      <span class="title">退款</span>
      <div class="center"></div>
      <Icon class="close" name="btn-close" size="14" color="var(--tc-primary-text)" :click="closeDialog" />
    </section>
    <section class="content" v-loading="detailLoading">
      <DetailContent :options="detailOption">
        <template #baseInfo>
          <c-table v-model:data="detailData" :tableConfig="baseInfoConfig" :columnsConfig="baseInfoColumnsConfig">
            <template #invoiceState="{ row }">
              <div :style="{ color: row.invoiceState ? 'var(--tc-global-green)' : 'var(--tc-global-red)' }">
                {{ row.invoiceState ? '已开票' : '未开票' }}
              </div>
            </template>
          </c-table>
        </template>
        <template #refundMoneyDetail>
          <c-table v-model:data="detailData" :tableConfig="refundMoneyDetailConfig" :columnsConfig="refundMoneyDetailColumnsConfig">
            <template v-for="key in ['receiptAmount', 'permitAmount']" #[key]="{ row }" :key="key">
              <span>{{ formatPrice(row[key]) }}</span>
              <span class="spanChild c-mb2 el-input__suffix">{{ row.receiptDocCur }}</span>
            </template>
          </c-table>
        </template>
        <template #operateRecord>
          <ProcessBar :data="processBarData" :statusMap="processBarStatusMap" :fieldMap="processBarFieldMap" class="c-ml5 c-mb5" />
          <c-table v-model:data="operateRecordData" :tableConfig="operateRecordConfig" :columnsConfig="operateRecordColumnsConfig">
            <template #result="{ row }">
              <el-select-v2
                v-if="row.isCurrentNode && permissonData.showApprovalBtn"
                v-model="row.result"
                :options="resultList"
                placeholder="请选择"
                size="small"
                style="width: 100%"
                :item-height="24"
                class="operate-record-select"
                :class="generateClass(row)"
              />
              <span v-else :style="generateStyle(row)">{{ row.result }}</span>
            </template>
            <template #remark="{ row }">
              <el-input
                v-if="row.isCurrentNode && permissonData.showApprovalBtn"
                v-model="row.remark"
                style="width: 100%"
                placeholder="请输入"
                size="small"
                :class="generateClass(row)"
              />
              <span v-else :style="generateStyle(row)">{{ row.remark }}</span>
            </template>
          </c-table>
        </template>
      </DetailContent>
    </section>
    <section class="footer">
      <template v-for="(item, index) in btnOption">
        <el-button v-if="item.show" :key="index" :type="item?.type" @click="item.click" :loading="item?.loading" class="c-mx60">
          <Icon v-show="!item?.loading" :name="item.iconName" size="13" class="c-mr4" :class="item.iconClass" />
          <span>{{ item.text }}</span>
        </el-button>
      </template>
    </section>

    <el-dialog v-model="visible" title="温馨提示" width="350px" @close="handleClose" :append-to-body="true">
      <div style="color: #f8b500">收款方名称与业务伙伴名称不一致，确认提交吗？</div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="warning" @click="handleSubmit">确认提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="tsx" setup>
import { ref, shallowRef, computed } from 'vue'
import DetailContent from '@/components/detailContent/index.vue'
import {
  GetBase,
  GetSaleRefundPreview,
  ApplySaleRefund,
  SaleRefundApprova,
  GetSaleRefundDetail,
  SaleRefundReCall,
  SaleRefundDelete,
  type ApplySaleRefundParams,
  type SaleRefundApprovaParams
} from '../request'
import { setIndicatorList } from '@/utils/setIndicatorList'
import { requestSuccess } from '@/utils/requestSuccess'
import { ElMessage } from 'element-plus'
import { deepClone } from '@/utils/common'
import ProcessBar from '@/components/processBar/index.vue'
import type { ProcessBarData } from '../types'
import { numberFormat2 } from '@/utils/format'

interface DetailData {
  orderId: number // 销售订单 id
  refundId: number // 退款单 id
  indicator: string
  indicatorName: string
  cardCode: string
  cardName: string
  applyCurrency: string
  receiptDocCur: string
  receiptAmount: number
  invoiceState: string
  billTotalAmount: number
  receiveAccountName: string
  receiveAccount: string
  receiveBankName: string
  permitAmount: number
  applyAmount: number | string
  remark: string
  refundPath: number | string
  reason: number | string
  returnRecord: SelectList[] | null
  returnDocEntry: string[] | null
}
interface PermissonData {
  showSubmitBtn: boolean // 是否展示提交按钮。该按钮存在则表示页面可编辑
  showApprovalBtn: boolean // 是否展示审批按钮
  showRecallBtn: boolean // 是否展示撤回按钮
  showDeleteBtn: boolean // 是否展示删除按钮
}
interface Currency {
  id: string
  name: string
  label: string
  value: string
}
let currentQueryId: number | null = null // 打开当前页面的查询 id
const detailData = ref<Partial<DetailData>[]>([])
const detailLoading = shallowRef<boolean>(false)
const permissonData = ref<PermissonData>({ showSubmitBtn: true, showApprovalBtn: true, showRecallBtn: true, showDeleteBtn: true })
const currencyList = ref<Currency[]>([])
const visible = ref<boolean>(false)
const emit = defineEmits(['search'])

// 模块配置
const detailOption = computed(() => {
  const baseItem = [
    { defaultShow: true, index: 1, title: '基本信息', contentSlot: 'baseInfo' },
    { defaultShow: true, index: 2, title: '退款详情', contentSlot: 'refundMoneyDetail' }
  ]
  // 新增时不显示操作记录模块
  const operateRecordItem = isAddMode.value ? [] : [{ defaultShow: true, index: 3, title: '操作记录', contentSlot: 'operateRecord' }]
  return [...baseItem, ...operateRecordItem]
})

// 基本信息
const refundPathMap = { oldWayBack: 1, otherAccountBack: 2 }
const refundPathList: SelectList[] = [
  { label: '原路返回', value: refundPathMap.oldWayBack },
  { label: '其它账户退款', value: refundPathMap.otherAccountBack }
]
const indicatorList = shallowRef<SelectList[]>([])
const baseInfoConfig = { 'highlight-current-row': false }
const baseInfoColumnsConfig = computed(() => {
  const { refundPath } = detailData.value[0] ?? {}
  const { showSubmitBtn } = permissonData.value!
  const receiveSlotName = refundPath === refundPathMap.otherAccountBack && showSubmitBtn && 'input'
  return [
    { label: '业务伙伴代码', prop: 'cardCode', width: '100' },
    { label: '业务伙伴名称', prop: 'cardName', width: '300' },
    { label: '开票状态', prop: 'invoiceState', width: '100', slotName: 'invoiceState' },
    {
      label: '退款方标识',
      prop: 'indicator',
      width: '100',
      slotName: showSubmitBtn && 'select',
      slotAttr: { options: indicatorList.value }
    },
    { label: '退款路径', prop: 'refundPath', width: '120', slotName: showSubmitBtn && 'select', slotAttr: { options: refundPathList } },
    { label: '收款方名称', prop: 'receiveAccountName', width: '300', slotName: receiveSlotName },
    { label: '收款方账号', prop: 'receiveAccount', width: '300', slotName: receiveSlotName },
    { label: '收款方开户行', prop: 'receiveBankName', width: '300', slotName: receiveSlotName }
  ]
})

// 退款详情
const reasonMap = { cancelOrder: 1, returnAll: 2, other: 3 }
const reasonList: SelectList[] = [
  { label: '取消订单', value: reasonMap.cancelOrder },
  { label: '退货退款', value: reasonMap.returnAll },
  { label: '其它', value: reasonMap.other }
]
const returnRecordList = shallowRef<SelectList[]>([])
const refundMoneyDetailConfig = { 'highlight-current-row': false }
const refundMoneyDetailColumnsConfig = computed(() => {
  const { reason } = detailData.value[0] ?? {}
  const { showSubmitBtn } = permissonData.value
  return [
    { label: '单据来源', prop: 'orderId', width: '100', slotName: 'addArrow', slotParams: { prefix: 'SE-' } },
    { label: '收款总额', prop: 'receiptAmount', width: '120', slotName: 'receiptAmount', align: 'right' },
    { label: '可退款金额', prop: 'permitAmount', width: '120', slotName: 'permitAmount', align: 'right' },
    {
      label: '申请退款金额',
      prop: 'applyAmount',
      width: '120',
      slotName: showSubmitBtn ? 'input' : 'price',
      // slotOn: { blur: checkApplyAmount },
      align: 'right',
      className: 'input-text-right'
    },
    {
      label: '币种',
      prop: 'applyCurrency',
      width: '90',
      slotName: showSubmitBtn && 'select',
      slotAttr: { options: currencyList }
    },
    {
      label: '退款原因',
      prop: 'reason',
      width: '150',
      slotName: showSubmitBtn && 'select',
      slotAttr: { options: reasonList },
      slotOn: { change: reasonEventHandler }
    },
    {
      label: '关联单号',
      prop: 'returnDocEntry',
      width: '150',
      slotName: showSubmitBtn && reason === reasonMap.returnAll && 'select',
      slotAttr: { options: returnRecordList.value, multiple: true, 'collapse-tags': true, clearable: true }
    },
    {
      label: '备注',
      prop: 'remark',
      width: '300',
      slotName: showSubmitBtn && 'input'
    }
  ]
})

const formatPrice = (price: number) => {
  const amountPrice = numberFormat2({
    value: price,
    isInteger: false,
    min: 2,
    max: 2
  })
  return amountPrice
}

// function checkApplyAmount() {
//   const { applyAmount, permitAmount } = detailData.value[0] ?? {}
//   if (Number(applyAmount) > Number(permitAmount)) {
//     detailData.value[0].applyAmount = ''
//     ElMessage({ type: 'warning', message: '退款金额大于可退款金额，请重新输入' })
//   }
// }

function reasonEventHandler(value: number) {
  if (value === reasonMap.cancelOrder) {
    detailData.value[0].returnDocEntry = []
  }
}

// 操作记录
const resultMap = { agree: 1, reject: 2 }
const resultList: SelectList[] = [
  { label: '已批准', value: resultMap.agree },
  { label: '已拒绝', value: resultMap.reject }
]
interface OperateRecordData {
  isCurrentNode: boolean // 是否当前审批节点
  nodeName: string
  creatorName: string
  dateTime: string
  intervalTime: string
  result: string | number
  remark: string
}
const operateRecordData = shallowRef<Partial<OperateRecordData>[]>([])
const operateRecordConfig = { 'highlight-current-row': false, stripe: false }
const operateRecordColumnsConfig = computed(() => {
  return [
    { slotName: 'index' },
    { label: '操作记录', prop: 'nodeName', width: '100' },
    { label: '操作人', prop: 'creatorName', width: '150' },
    { label: '操作时间', prop: 'dateTime', width: '150', slotName: 'datetime' },
    { label: '审批时长', prop: 'intervalTime', width: '100', align: 'right' },
    { label: '审批结果', prop: 'result', width: '100', slotName: 'result' },
    { label: '备注', prop: 'remark', width: '500', slotName: 'remark' }
  ]
})
function generateStyle(row: OperateRecordData) {
  return {
    color:
      new Map([
        [row.result === '已批准', 'var(--tc-global-green)'],
        [row.result === '已拒绝', 'var(--tc-global-red)']
      ]).get(true) ?? 'var(--tc-primary-text)'
  }
}
function generateClass(row: OperateRecordData) {
  return (
    new Map([
      [row.result === resultMap.agree, 'form-text-green'],
      [row.result === resultMap.reject, 'form-text-red']
    ]).get(true) ?? ''
  )
}

// 流程条
const processBarStatusMap = {
  pending: 0, // 未决
  agree: 1, // 同意
  reject: 2 // 驳回
}
const processBarFieldMap = {
  name: 'nodeName',
  status: 'status',
  time: 'operatorTime',
  intervalTime: 'auditTime',
  info: 'info',
  infoFieldMap: { infoName: 'operatorName', infoStatus: 'status' }
}
const processBarData = shallowRef<ProcessBarData[]>([])

// 提交、更新、撤回
const btnLoading = shallowRef<boolean>(false)
const btnOption = computed(() => {
  const { showSubmitBtn, showApprovalBtn, showRecallBtn, showDeleteBtn } = permissonData.value
  return [
    { text: '取消', show: true, click: closeDialog, iconName: 'btn-close', iconClass: 'c-mb1' },
    { text: '提交', type: 'warning', show: showSubmitBtn, click: submitOrder, iconName: 'btn-confirm', loading: btnLoading.value },
    { text: '更新', type: 'success', show: showApprovalBtn, click: approveOrder, iconName: 'btn-reflesh', loading: btnLoading.value },
    { text: '撤回', type: 'warning', show: showRecallBtn, click: recallOrder, iconName: 'btn-recall', loading: btnLoading.value },
    { text: '删除', type: 'danger', show: showDeleteBtn, click: deleteOrder, iconName: 'btn-delete', loading: btnLoading.value }
  ]
})
// 默认需要非空判断的 key
const defaultEmptyKeys: Array<keyof DetailData> = [
  'indicator',
  'refundPath',
  'receiveAccountName',
  'receiveAccount',
  'receiveBankName',
  'applyAmount',
  'reason',
  'applyCurrency' // 币种
]
// 最终需要非空判断的 key
const finallyEmptyKeys = computed(() => {
  const { reason } = detailData.value[0] ?? {}
  const result: Array<keyof DetailData> = deepClone(defaultEmptyKeys)
  // 退款原因为退货退款
  reason === reasonMap.returnAll && result.push('returnDocEntry')
  return [...new Set(result)]
})
function submitOrder() {
  const message = getMessage()
  if (message) {
    ElMessage({ type: 'warning', message })
    return
  }

  // 收款方名称与业务伙伴名称不一致时，弹框确认
  const { cardName, receiveAccountName } = detailData.value[0]
  if (cardName !== receiveAccountName) {
    visible.value = true
    return
  }

  // 提交订单
  handleSubmit()
}
// 提交
function handleSubmit() {
  visible.value = false
  const params = {} as ApplySaleRefundParams
  const keys = Object.keys(detailData.value[0]) as Array<keyof DetailData>
  keys.forEach((key) => {
    const isMatch = defaultEmptyKeys.concat(['orderId', 'refundId', 'remark', 'returnDocEntry']).includes(key)
    if (isMatch) {
      const initValue = detailData.value[0][key]
      const value = new Map([[['applyAmount'].includes(key), Number(initValue)]]).get(true) ?? initValue
      Reflect.set(params, key, value)
    }
  })
  const requestParams = { api: ApplySaleRefund, params, loading: btnLoading, cb: commonCallBack }
  requestSuccess<ApplySaleRefundParams>(requestParams)
}
function approveOrder() {
  const { result, remark } = operateRecordData.value.find((i) => i.isCurrentNode)!
  const params = { docEntry: detailData.value[0].refundId, approvalType: Number(result), opinion: remark }
  const requestParams = { api: SaleRefundApprova, params, loading: btnLoading, cb: commonCallBack }
  requestSuccess<SaleRefundApprovaParams>(requestParams)
}
function recallOrder() {
  const requestParams = { api: SaleRefundReCall, params: { docEntry: detailData.value[0].refundId }, loading: btnLoading, cb: commonCallBack }
  requestSuccess<{ docEntry: number }>(requestParams)
}
function deleteOrder() {
  const requestParams = { api: SaleRefundDelete, params: { globelApprovalId: currentQueryId }, loading: btnLoading, cb: commonCallBack }
  requestSuccess<{ globelApprovalId: number }>(requestParams)
}
function commonCallBack(res: Awaited<CustomResponse>) {
  if (res.code === 200) {
    ElMessage({ type: 'success', message: '操作成功' })
    emit('search')
    detailVisible.value = false
  }
}
function getMessage() {
  let message = ''
  for (let key of finallyEmptyKeys.value) {
    const value = detailData.value[0][key]
    if (!value || (Array.isArray(value) && value.length === 0)) {
      // 注意 prop 不能重名
      const mergeColumns = [...baseInfoColumnsConfig.value, ...refundMoneyDetailColumnsConfig.value]
      message = mergeColumns.find((i) => i.prop === key)?.label + '不能为空'
      break
    }
  }
  // 退款金额大小判断交给后端判断
  // if (!message) {
  //   const { permitAmount, applyAmount } = detailData.value[0] ?? {}
  //   message = new Map([[Number(permitAmount) < Number(applyAmount), '退款金额大于可退款金额，请修改']]).get(true) ?? ''
  // }
  return message
}

// 打开或关闭弹窗
let isAddMode = shallowRef<boolean>(false)
const detailVisible = shallowRef<boolean>(false)
const closeDialog = () => (detailVisible.value = false)
interface QueryParams {
  isAdd: boolean // 是否为新增退款单
  id: number // 销售订单 id 号或者审批序号 id。新增时使用销售订单 id，新增后使用审批序号 id
}
const openDialog = async (params: QueryParams) => {
  try {
    const { isAdd, id } = params
    detailLoading.value = true
    detailVisible.value = true
    isAddMode.value = isAdd
    currentQueryId = id
    permissonData.value = { showSubmitBtn: false, showApprovalBtn: false, showRecallBtn: false, showDeleteBtn: false }
    // 设置标识列表数据
    setIndicatorList(indicatorList)
    // 获取新增退款单预设数据: getSaleRefundPreview
    // 获取新增退款单后的审批详情: getSaleRefundDetail
    const getDetail = isAdd ? getSaleRefundPreview : getSaleRefundDetail
    await Promise.all([getDetail(id), getBaseData()])
  } finally {
    detailLoading.value = false
  }
}
async function getSaleRefundPreview(orderId: number) {
  const res = await GetSaleRefundPreview({ orderId })
  const { code, result } = res
  if (code === 200) {
    const { returnRecord } = result
    detailData.value = [result].map((i) => ({ ...i, returnDocEntry: [] }))
    returnRecordList.value = returnRecord ?? []
    permissonData.value.showSubmitBtn = true
    processBarData.value = []
  }
}
async function getSaleRefundDetail(globelApprovalId: number) {
  const res = await GetSaleRefundDetail({ globelApprovalId })
  const { code, result } = res
  if (code === 200) {
    const { refundOperatorHistories, permission, returnRecord, processNode } = result
    const { showSubmitBtn } = permission
    permissonData.value = permission
    returnRecordList.value = returnRecord ?? []
    operateRecordData.value = refundOperatorHistories
    detailData.value = [result].map((item) => {
      const { indicator, refundPath, reason, returnDocEntry } = item
      return {
        ...item,
        indicator: getListValue(indicator, indicatorList.value, showSubmitBtn),
        refundPath: getListValue(refundPath, refundPathList, showSubmitBtn),
        reason: getListValue(reason, reasonList, showSubmitBtn),
        returnDocEntry: showSubmitBtn
          ? (returnDocEntry ?? [])
          : (returnRecord?.flatMap((i: SelectList) => (returnDocEntry.includes(i.value) ? i.label : [])).join(',') ?? '')
      }
    })
    processBarData.value = processNode ?? []
  }
}
function getListValue(value: number | string, list: SelectList[], showSubmitBtn: boolean) {
  return showSubmitBtn ? value : (list.find((i) => i.value === value)?.label ?? '')
}

// 获取币种
async function getBaseData() {
  const res = await GetBase()
  const { code, result } = res
  if (code === 200) {
    const { currency } = result
    currencyList.value = currency.map((item: Currency) => {
      return {
        ...item,
        label: item.id,
        value: item.id
      }
    })
  }
}

// 弹框处理
const handleClose = () => {
  visible.value = false
}

defineExpose({ openDialog })
</script>

<style scoped lang="scss">
@import '@/styles/page-detail.scss';
@include pageDetail;
:deep(.form-text-green .el-input__inner),
:deep(.form-text-green .el-select__selected-item) {
  color: var(--tc-global-green);
}

:deep(.form-text-red .el-input__inner),
:deep(.form-text-red .el-select__selected-item) {
  color: var(--tc-global-red);
}
:deep(.operate-record-select .el-select__wrapper) {
  padding: 0 4px;
}
:deep(.input-text-right .cell span),
:deep(.input-text-right .el-input__inner) {
  color: var(--tc-global-red) !important;
}
.spanChild {
  margin-left: 8px;
}
</style>
