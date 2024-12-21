<template>
  <div>
    <el-dialog v-model="dialogVisible" title="汇总列表" width="1050" draggable @close="unLockThePayment(true)">
      <el-form ref="form" :model="formData" label-width="auto" size="default">
        <el-form-item label="付款账号">
          <el-radio-group v-model="formData.accountCode">
            <el-radio v-for="item in radioOption" :key="item.key" :value="item.key">{{ item.value }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="付款方式">
          <el-radio-group v-model="formData.payWay">
            <el-radio value="1">转账</el-radio>
            <el-radio value="2">代发</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <c-table ref="table" v-model:data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig"> </c-table>
      <template #footer>
        <div class="c-flex-center">
          <el-button @click="closeDialog">
            <Icon name="btn-close" size="13" class="c-mr2" />
            <span>取消</span>
          </el-button>
          <el-button type="warning" @click="nextStep" :loading="btnLoading">
            <Icon v-show="!btnLoading" name="btn-next-step" size="13" class="c-mr2" />
            <span>下一步</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
    <PreViewDialog ref="preViewDialog" @closeDialog="closeDialog" v-model:btnLoading="btnLoading" />
  </div>
</template>

<script lang="tsx" setup>
import { shallowRef, reactive, nextTick } from 'vue'
import { GetPaymentDataBeforeCommit, UnLockThePayment } from '@/views/finance/payment/request'
import PreViewDialog from './PreViewDialog.vue'
import { ElMessage } from 'element-plus'
import type { SumRowData } from '@/views/finance/payment/types'

interface RadioOption {
  key: string
  value: string
  defalut: boolean
}
interface FormData {
  accountCode: string
  payWay: string
}

let onlyPaymentIds: number[]
let baseParams: AnyObject = {}
const dialogVisible = shallowRef<boolean>(false)
const btnLoading = shallowRef<boolean>(false)
const radioOption = shallowRef<RadioOption[]>([])
const tableData = shallowRef<SumRowData[]>([])
const formData = reactive<FormData>({ accountCode: '', payWay: '' })
const table = shallowRef()

const tableConfig = { height: '100%', width: '100%' }
const columnsConfig = [
  { label: '付款号', prop: 'paymentNumber', width: '70' },
  { label: '单据来源', prop: 'docTypeName', width: '70' },
  { label: '收款方名称', prop: 'receiveAccountName', width: '90' },
  { label: '收款方账户', prop: 'receiveAccount', width: '145' },
  { label: '开户行名称', prop: 'bankName', width: '150' },
  { label: '申请人', prop: 'applicant', width: '70' },
  { label: '币种', prop: 'currency', width: '40' },
  { label: '金额', prop: 'amount', width: '90', slotName: 'price' },
  {
    label: '扣款金额',
    prop: 'cutPayment',
    width: '90',
    slotName: 'input',
    align: 'right',
    className: 'input-text-right',
    slotOn: { input: () => updateActualPay(false), change: () => updateActualPay(true) }
  },
  { label: '实付金额', prop: 'actualPay', width: '90', slotName: 'price' },
  { label: '付款用途', prop: 'usage', width: '120', slotName: 'input', slotAttr: { maxlength: 360 }, required: true }
]
function updateActualPay(changeEvent?: boolean) {
  tableData.value = tableData.value.map((i) => {
    return { ...i, cutPayment: changeEvent ? Number(i.cutPayment) : i.cutPayment, actualPay: Number(i.amount) - Number(i.cutPayment) }
  })
}

const preViewDialog = shallowRef()
const nextStep = () => {
  btnLoading.value = true
  const { accountCode, payWay } = formData
  const hasEmptyUsage = tableData.value.some((i) => !i.usage)
  const map = new Map([
    [!accountCode, '付款账号不能为空'],
    [!payWay, '付款方式不能为空'],
    [hasEmptyUsage, '付款用途不能为空']
  ])
  const message = map.get(true)
  if (message) {
    btnLoading.value = false
    ElMessage({ type: 'warning', message })
    // 表格自动滚动到最后
    hasEmptyUsage && table.value.getInstance().setScrollLeft(1000)
  } else {
    const params = { ...baseParams, accountCode, payWay, getPaymentBeforeCommitResps: tableData.value }
    preViewDialog.value.openDialog(params, true)
  }
}

const closeDialog = () => (dialogVisible.value = false)
const eventHandler = (event: Event) => {
  event?.preventDefault()
  unLockThePayment()
}
// 解锁付款单
function unLockThePayment(needRemoveListener = false) {
  UnLockThePayment(onlyPaymentIds)
  if (!dialogVisible.value || needRemoveListener) {
    window.removeEventListener('beforeunload', eventHandler)
  }
}

interface Argument {
  paymentIds: number[] // 付款单 id
  isVisibility: boolean // 弹窗是否可见
}
const openDialog = async (argument: Argument) => {
  window.addEventListener('beforeunload', eventHandler) // 关闭浏览器、关闭浏览器标签、浏览器刷新时触发
  Object.assign(formData, { accountCode: '', payWay: '' }) // 清空缓存
  onlyPaymentIds = argument.paymentIds
  const res = await GetPaymentDataBeforeCommit({ paymentIds: onlyPaymentIds })
  const { extraData, code, data, message } = res
  const { accounts, batchNum, paymentIds, defaultSelected } = extraData ?? {}
  if (code === 200) {
    // message 存在时提示，但不影响正常执行
    message && ElMessage({ type: 'warning', message })
    radioOption.value = accounts ?? []
    tableData.value = data ?? []
    dialogVisible.value = true
    Object.assign(formData, defaultSelected)
    baseParams = { ...baseParams, getPaymentBeforeCommitResps: tableData.value, batchNum, paymentIds, onlyPaymentIds }
    await nextTick()
    // 初始化时表格自动滚动到最左边
    table.value.getInstance().setScrollLeft(0)
  }
}

defineExpose({ openDialog })
</script>

<style scoped lang="scss">
:deep(.el-form-item) {
  margin-bottom: 0;
  margin-left: 4px;
}
:deep(.el-form-item label) {
  font-size: 12px;
}
</style>
