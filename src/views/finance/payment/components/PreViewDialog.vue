<template>
  <el-dialog v-model="dialogVisible" title="预览页面" :width="templateOption.width" :append-to-body="true" draggable>
    <c-table ref="table" v-model:data="tableData" :tableConfig="templateOption.tableConfig" :columnsConfig="templateOption.columnsConfig"> </c-table>
    <template #footer>
      <div class="c-flex-center">
        <template v-for="(item, index) in btnOption">
          <el-button v-if="item.show" :key="index" :type="item.type" @click="item.click" :loading="item.icon.loading">
            <Icon v-show="!item.icon.loading" :name="item.icon.name" :size="item.icon.size" :class="item.icon.class" />
            <span>{{ item.text }}</span>
          </el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { shallowRef, computed, inject, nextTick } from 'vue'
import { GetPaymentPreview, ExportPayment, CommitPayment, BatchPaymentPrint } from '@/views/finance/payment/request'
import { domToExcelHandler } from '@/hooks/useExcel'
import { ElMessage } from 'element-plus'

let preParams: AnyObject
const dialogVisible = shallowRef<boolean>(false)
const btnLoading = shallowRef<boolean>(false)
const tableData = shallowRef<AnyObject[]>([])
const isPayBtn = shallowRef<boolean>() // true 表示支付按钮， false 表示导出按钮
const isShowPreBtn = shallowRef<boolean>(false)
const updateRootData = inject<Function>('updateRootData', () => {})

const btnOption = computed(() => {
  const getIcon = (name: string) => {
    const loading = ['btn-close', 'btn-prev-step'].includes(name) ? null : btnLoading.value
    return { name, size: '13px', class: 'c-mr2', loading }
  }
  const _closeDialog = () => (dialogVisible.value = false)
  return [
    { text: '关闭', type: '', show: true, click: closeDialog, icon: getIcon('btn-close') },
    { text: '上一步', type: 'warning', show: isShowPreBtn.value, click: _closeDialog, icon: getIcon('btn-prev-step') },
    { text: '仅支付', type: 'warning', show: isPayBtn.value, click: payMoney(false), icon: getIcon('btn-pay-money') },
    { text: '支付并打印', type: 'warning', show: isPayBtn.value, click: payMoney(true), icon: getIcon('btn-print') },
    { text: '仅导出', type: 'warning', show: !isPayBtn.value, click: exportExcel(false), icon: getIcon('btn-export') },
    { text: '导出并打印', type: 'warning', show: !isPayBtn.value, click: exportExcel(true), icon: getIcon('btn-print') }
  ]
})

interface OptionValue {
  width: number
  columnsConfig: AnyObject[]
  tableConfig: AnyObject
  fileName: string
}
interface TemplateOption {
  [key: string]: OptionValue
}
let curTemplate = 1
const templateStr = shallowRef('JT_BANk_TRANSFER')
const templateMap: Record<number, string> = {
  1: 'JT_BANk_TRANSFER', // 交行转账模板
  2: 'JT_BANK_PAYMENT', // 交行代发模板
  3: 'ZS_BANk_TRANSFER', // 招商银行转账模板
  4: 'ZS_BANK_PAYMENT' // 招商银行代发模板
}
const templateOption = computed(() => {
  const tableConfig = { height: '250px', width: '100%', 'show-header': templateStr.value !== 'JT_BANK_PAYMENT' }
  const optionMap: TemplateOption = {
    JT_BANk_TRANSFER: { width: 1200, columnsConfig: [], tableConfig, fileName: '交行转账表单' },
    JT_BANK_PAYMENT: { width: 720, columnsConfig: [], tableConfig, fileName: '交行代发表单' },
    ZS_BANk_TRANSFER: { width: 1200, columnsConfig: [], tableConfig, fileName: '招商银行转账表单' },
    ZS_BANK_PAYMENT: { width: 900, columnsConfig: [], tableConfig, fileName: '招商银行代发表单' }
  }
  setColumnsConfig(optionMap)
  return optionMap[templateStr.value]
})
function setColumnsConfig(optionMap: TemplateOption) {
  switch (templateStr.value) {
    case 'JT_BANk_TRANSFER':
      optionMap[templateStr.value].columnsConfig = [
        { label: '交易金额', prop: 'amount', width: '90', slotName: 'price' },
        { label: '付款方账号', prop: 'payAccount', width: '160' },
        { label: '付款方户名', prop: 'payAccountName', width: '160' },
        { label: '付款方账户开户行', prop: 'payAccountBankName', width: '200' },
        { label: '收款方开户行全称', prop: 'receiveAccountBankName', width: '200' },
        { label: '收款方账号', prop: 'receiveAccount', width: '200' },
        { label: '收款方户名', prop: 'receiveAccountName', width: '90' },
        { label: '用途', prop: 'usage', width: '80' },
        { label: '是否交行账号', prop: 'isJHAcount', width: '100' },
        { label: '是否同城', prop: 'isSameCity', width: '80' },
        { label: '收款方支付行号', prop: 'unionPayNum', width: '100' },
        { label: '币种', prop: 'currency', width: '60' },
        { label: 'ERP 序号', prop: 'erpNum', width: '100' }
      ]
      break
    case 'JT_BANK_PAYMENT':
      optionMap[templateStr.value].columnsConfig = [
        { label: '账号', prop: 'receiveAccount', width: '160' },
        { label: '户名', prop: 'receiveAccountName', width: '100' },
        { label: '金额', prop: 'amount', width: '100', slotName: 'price' },
        { label: '是否本行卡', prop: 'jhBankMark', width: '100' },
        { label: '摘要', prop: 'remark', width: '100' },
        { label: '关联报销单号', prop: 'relatedOrders', width: '120' }
      ]
      break
    case 'ZS_BANk_TRANSFER':
      optionMap[templateStr.value].columnsConfig = [
        { label: '业务参考号', prop: 'businessRefNo', width: '80' },
        { label: '收款账号', prop: 'receiveAccount', width: '160' },
        { label: '收方名称', prop: 'receiveAccountName', width: '200' },
        { label: '收方行联行号', prop: 'unionPayNum', width: '160' },
        { label: '收方开户行', prop: 'receiveAccountBankName', width: '200' },
        { label: '收方开户地', prop: 'receiveAccountAddress', width: '200' },
        { label: '金额', prop: 'amount', width: '90', slotName: 'price' },
        { label: '用途', prop: 'usage', width: '70' },
        { label: '内部附言（摘要）', prop: 'innerSummary', width: '120' },
        { label: '收方移动电话', prop: 'receiveMobilePhone', width: '100' },
        { label: '收方邮件', prop: 'receiveEmail', width: '100' }
      ]
      break
    case 'ZS_BANK_PAYMENT':
      optionMap[templateStr.value].columnsConfig = [
        { label: '账号', prop: 'receiveAccount', width: '100' },
        { label: '户名', prop: 'receiveAccountName', width: '100' },
        { label: '金额', prop: 'amount', width: '100', slotName: 'price' },
        { label: '开户行', prop: 'receiveAccountBankName', width: '200' },
        { label: '开户地', prop: 'bankOpenLocation', width: '200' },
        { label: '汇款备注', prop: 'remittanceRemark', width: '170' }
      ]
      break
  }
}

const table = shallowRef()
const emit = defineEmits(['closeDialog', 'update:btnLoading'])
const assembleParams = (needTemplate: boolean) => {
  const { accountCode, batchNum, getPaymentBeforeCommitResps, paymentIds, payway } = preParams
  const newParams = {
    payway,
    accountCode,
    batchNum,
    getPaymentBeforeCommitResps,
    paymentId2GlobalIds: paymentIds
  }
  return needTemplate ? { ...newParams, template: curTemplate } : newParams
}
const exportExcel = (needPrint: boolean) => {
  return () => {
    btnLoading.value = true
    const newParams = assembleParams(false)
    ExportPayment(newParams)
      .then(async (res) => {
        if (res.code === 200) {
          domToExcelHandler(table, `${templateOption.value.fileName}.xls`)
          ElMessage({ type: 'success', message: '表单导出成功' })
          needPrint && (await printHandler())
          closeDialog()
          updateRootData() // 更新父组件表格数据
        }
      })
      .finally(() => {
        btnLoading.value = false
      })
  }
}
const payMoney = (needPrint: Boolean) => {
  return () => {
    btnLoading.value = true
    const newParams = assembleParams(true)
    CommitPayment(newParams)
      .then(async (res) => {
        if (res.code === 200) {
          needPrint && (await printHandler())
          ElMessage({ type: 'success', message: '已提交付款请求，待授权' })
          closeDialog()
          updateRootData() // 更新父组件表格数据
        }
      })
      .finally(() => {
        btnLoading.value = false
      })
  }
}
async function printHandler() {
  try {
    const { onlyPaymentIds } = preParams
    const res = await BatchPaymentPrint({ paymentIds: onlyPaymentIds })
    const url = URL.createObjectURL(res)
    await nextTick()
    window.open(url)
  } catch (error) {
    Promise.reject(`打印失败${error}`)
  }
}
function closeDialog() {
  emit('closeDialog')
  dialogVisible.value = false
}

const openDialog = (params: AnyObject, hasPre: boolean) => {
  preParams = params
  isShowPreBtn.value = hasPre
  const { accountCode, payWay, getPaymentBeforeCommitResps, paymentIds } = params
  const newParams = { accountCode, payWay, getPaymentBeforeCommitResps, paymentIdAndGlobalIds: paymentIds }
  GetPaymentPreview(newParams)
    .then((res) => {
      const { code, data, extraData } = res
      const { needNetWorkPay, template } = extraData
      if (code === 200) {
        curTemplate = template
        isPayBtn.value = needNetWorkPay
        templateStr.value = templateMap[template]
        tableData.value = data
        dialogVisible.value = true
      }
    })
    .finally(() => {
      emit('update:btnLoading', false)
    })
}

defineExpose({ openDialog })
</script>

<style scoped lang="scss"></style>
