<template>
  <!-- 父级元素需是 relative 定位，且宽高均为 100% -->
  <div v-show="detailVisible" class="wrapper">
    <section class="header">
      <span class="title">新建付款单</span>
      <div class="center"></div>
      <Icon class="close" name="btn-close" size="14" color="var(--tc-primary-text)" :click="closeDialog" />
    </section>
    <section class="content">
      <DetailContent :options="detailOption">
        <template #baseInfo>
          <c-table v-model:data="baseInfoData" :tableConfig="baseInfoConfig" :columnsConfig="baseInfoColumnsConfig" />
        </template>
        <template #accounting>
          <c-table v-model:data="accountingData" :tableConfig="accountingConfig" :columnsConfig="accountingColumnsConfig" />
        </template>
        <template #payDetail>
          <div class="c-flex-column">
            <c-table v-model:data="payDetailData" :tableConfig="payDetailConfig" :columnsConfig="payDetailColumnsConfig" />
            <div class="c-flex-ycenter c-mt10 c-pr4" :style="{ width: bottomContentWidth + 'px', justifyContent: 'flex-end' }">
              <label style="color: var(--tc-label-text)">扣减金额：</label>
              <el-input v-model="deductAmount" style="width: 80px" placeholder="请输入" class="c-mr10" />
              <label style="color: var(--tc-label-text)">实际支付：</label>
              <span style="color: var(--tc-primary-text)">{{ numberFormat(actualAmount) }}</span>
            </div>
          </div>
        </template>
        <template #accessory>
          <c-table v-model:data="accessoryData" :tableConfig="accessoryTableConfig" :columnsConfig="accessoryColumnsConfig">
            <template #operate="{ row }">
              <Icon
                v-if="row.file"
                name="btn-delete"
                size="15"
                color="var(--tc-global-red)"
                class="c-mt2 c-mr15 c-cursor-p"
                :click="() => deleteFile(row.file_cate)"
              />
            </template>
          </c-table>
        </template>
        <template #accessoryTitle>
          <div class="c-flex-center c-ml10">
            <el-button type="warning" class="c-mr5" @click="openUploadDialog" style="height: 18px">
              <Icon name="btn-upload" size="12" />
              <span class="c-ml4">上传</span>
            </el-button>
            <el-tooltip class="box-item" effect="dark" content="支持格式：.rar,.zip,.doc,.docx,.pdf,.xls,.xlsx,.jpg;Max 20M" placement="top-start">
              <Icon name="btn-question" size="16" color="var(--tc-global-gray)" />
            </el-tooltip>
          </div>
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
    <UploadDialog ref="uploadDialog" @submit="updateAccessoryTable" />
  </div>
</template>

<script lang="tsx" setup>
import { shallowRef, computed, useTemplateRef } from 'vue'
import DetailContent from '@/components/detailContent/index.vue'
import UploadDialog from '@/components/uploadDialog/index.vue'
import { IndexCheckPayment, IndexInsertPayment } from '../request'
import { ElMessage, type UploadUserFile, type UploadRawFile } from 'element-plus'
import { getDateStr } from '@/utils/common'
import { numberFormat } from '@/utils/format'

type CommonRowData = AnyObject<string | number | null>
const emit = defineEmits(['onSearch'])

// 模块配置
const detailOption = [
  { defaultShow: true, index: 1, title: '基本信息', contentSlot: 'baseInfo' },
  { defaultShow: true, index: 2, title: '会计', contentSlot: 'accounting' },
  { defaultShow: true, index: 3, title: '付款明细', contentSlot: 'payDetail' },
  { defaultShow: true, index: 4, title: '附件', titleSlot: 'accessoryTitle', contentSlot: 'accessory' }
]

// 基本信息
const baseInfoData = shallowRef<CommonRowData[]>([])
const baseInfoConfig = { 'highlight-current-row': false }
const baseInfoColumnsConfig = [
  { label: '业务伙伴代码', prop: 'supplier_code', width: '100' },
  { label: '业务伙伴名称', prop: 'supplier_name', width: '200' },
  { label: '科目余额', prop: 'balance', width: '100', slotName: 'price' },
  { label: '付款条件', prop: 'pay_plan_name', width: '300' },
  { label: '系统操作者', prop: 'creator_name', width: '100' },
  { label: '过账日期', prop: 'posting_date', width: '130', slotName: 'datePicker' },
  { label: '付款日期', prop: 'payment_date', width: '130', slotName: 'datePicker' },
  { label: '备注', prop: 'remark', width: '150', slotName: 'input' }
]

// 会计
const costTypeList = shallowRef<CommonRowData[]>([])
const paymentTypeList: SelectList[] = [
  { label: '月结', value: 1 },
  { label: '分期付款', value: 2 },
  { label: '预付', value: 3 },
  { label: '货到付款', value: 4 }
]
const accountingData = shallowRef<CommonRowData[]>([])
const accountingConfig = { 'highlight-current-row': false }
const accountingColumnsConfig = computed(() => {
  return [
    { label: '付款类别', prop: 'payment_type', width: '100', slotName: 'select', slotAttr: { options: paymentTypeList } },
    { label: '付款标识', prop: 'identify_name', width: '100' },
    { label: '费用类别', prop: 'cost_type_id', width: '100', slotName: 'select', slotAttr: { options: costTypeList.value } }
  ]
})

// 付款明细
const deductAmount = shallowRef<string>('') // 扣减金额
const actualAmount = computed<number>(() => {
  const total = payDetailData.value.reduce((a, b) => (b ? a + Number(b.payment_amount) : a), 0)
  return total - Number(deductAmount.value)
})
const bottomContentWidth = shallowRef<number>(0)
const payDetailData = shallowRef<CommonRowData[]>([])
const payDetailConfig = { 'highlight-current-row': false, isCustomFooter: true, footerMethod: footMethod }
const payDetailColumnsConfig = [
  { slotName: 'index' },
  { label: '单据编号', prop: 'source_number', width: '90', slotName: 'addArrow' },
  { label: '单据类型', prop: 'sourct_type_name', width: '90' },
  { label: '关联采购单号', prop: 'purchase_order', width: '100', slotName: 'addArrow' },
  { label: '应付金额', prop: 'open_doc_total', width: '90', slotName: 'price' },
  { label: '已付款金额', prop: 'purchase_paid_sum', width: '90', slotName: 'price' },
  { label: '本期付款', prop: 'payment_amount', width: '90', slotName: 'input', align: 'right', className: 'input-text-right' }
]
function footMethod(prop: string, columnData: any[]) {
  let res = ''
  const textLabel = 'purchase_order'
  const numLabels = ['open_doc_total', 'purchase_paid_sum', 'payment_amount']
  if (prop === textLabel) res = '合计'
  if (numLabels.includes(prop)) {
    res = numberFormat(columnData.reduce((a, b) => a + Number(b), 0))
  }
  return res
}

// 附件
interface AccessoryRowData {
  file_name: string
  date: string
  operate: string
  url: string
  file_type: string
  file_cate: number // 附件 id
  file: undefined | UploadRawFile // 临时保存的附件数据
}
const emptyAccessory = [
  { file_name: '', date: '', operate: '', url: '', file_type: '对账单', file_cate: 1, file: undefined },
  { file_name: '', date: '', operate: '', url: '', file_type: '送货单', file_cate: 2, file: undefined },
  { file_name: '', date: '', operate: '', url: '', file_type: '合同', file_cate: 3, file: undefined }
]
const accessoryData = shallowRef<AccessoryRowData[]>([...emptyAccessory])
const selectedAccessoryData = shallowRef<AccessoryRowData[]>([])
const handleSelectChange = (value: AccessoryRowData[]) => (selectedAccessoryData.value = value)
const accessoryTableConfig = { 'highlight-current-row': false, selectRowOnClick: false, on: { 'selection-change': handleSelectChange } }
const previewFile = ({ row }: Record<'row', AccessoryRowData>) => window.open(row.url)
const accessoryColumnsConfig = [
  { type: 'selection' },
  { label: '文件类型', prop: 'file_type', width: '100' },
  { label: '文件', prop: 'file_name', width: '100', slotName: 'addArrow', slotOn: { click: previewFile } },
  { label: '上传时间', prop: 'date', width: '100' },
  { label: '操作', prop: 'operate', width: '40', slotName: 'operate', align: 'center' }
]
const uploadDialog = useTemplateRef<DialogInstance>('uploadDialog')
const openUploadDialog = () => {
  const length = selectedAccessoryData.value.length
  if (length === 0) {
    ElMessage({ type: 'warning', message: '请选择附件类型' })
  } else if (length > 1) {
    ElMessage({ type: 'warning', message: '只能选择一种附件类型' })
  } else if (selectedAccessoryData.value[0].file) {
    ElMessage({ type: 'warning', message: '请删除已上传附件' })
  } else {
    uploadDialog.value!.openDialog({ limit: 1, uploadServer: false })
  }
}
function updateAccessoryTable(files: UploadUserFile[]) {
  const { name, raw } = files[0]
  accessoryData.value = accessoryData.value.flatMap((item) => {
    const isCurrentRow = item.file_cate === selectedAccessoryData.value[0].file_cate
    if (isCurrentRow) {
      return {
        ...item,
        file: raw,
        file_name: name,
        date: getDateStr('curMonth', 'yyyy.MM'),
        url: raw ? URL.createObjectURL(raw) : ''
      }
    } else {
      return item
    }
  })
}
function deleteFile(file_cate: number) {
  accessoryData.value = accessoryData.value.flatMap((item) => {
    if (item.file_cate === file_cate) {
      return emptyAccessory.find((i) => i.file_cate === file_cate)!
    } else {
      return item
    }
  })
}

// 提交
const btnLoading = shallowRef<boolean>(false)
const btnOption = computed(() => {
  return [
    { text: '取消', show: true, click: closeDialog, iconName: 'btn-close', iconClass: 'c-mb1' },
    { text: '提交', type: 'warning', show: true, click: submitData, iconName: 'btn-confirm', loading: btnLoading.value }
  ]
})
function submitData() {
  const message = getSubmitMessage() // 检验
  if (message) {
    ElMessage({ type: 'warning', message })
  } else {
    btnLoading.value = true
    const params = assembleParams() // 组装参数
    IndexInsertPayment(params)
      .then((res) => {
        if (res.code === 200) {
          emit('onSearch')
          detailVisible.value = false
        }
      })
      .finally(() => {
        btnLoading.value = false
      })
  }
}
const isNumber = (str: string): boolean => /^-?\d*(\.\d+)?$/.test(str)
function getSubmitMessage() {
  const { posting_date, payment_date } = baseInfoData.value[0]
  const { payment_type, cost_type_id } = accountingData.value[0]
  const emptyPayDetailItem = payDetailData.value.find((i) => Number(i.payment_amount) === 0)
  const hasNoNumber = payDetailData.value.some((i) => {
    return typeof i.payment_amount === 'string' && !isNumber(i.payment_amount)
  })
  const map = new Map([
    [!posting_date, '过账日期不能为空'],
    [!payment_date, '付款日期不能为空'],
    [!payment_type, '付款类别不能为空'],
    [!cost_type_id, '费用类别不能为空'],
    [!!emptyPayDetailItem, `单据${emptyPayDetailItem?.source_number}的本期付款需大于0`],
    [actualAmount.value < 0, '扣减金额不能大于本期付款合计'],
    [!isNumber(deductAmount.value), '扣减金额只能输入数字'],
    [hasNoNumber, '本期付款只能输入数字']
  ])
  return map.get(true) ?? ''
}
function assembleParams(): FormData {
  const formData = new FormData()
  const deduct_amount = Number(deductAmount.value)
  const payment_amount = actualAmount.value
  const insertDto = {
    baseInfo: baseInfoData.value,
    account: accountingData.value.map((i) => ({ ...i, deduct_amount, payment_amount })),
    details: payDetailData.value,
    files: accessoryData.value.flatMap((i) => (i.file ? { file_cate: i.file_cate } : []))
  }
  const files: UploadRawFile[] = accessoryData.value.flatMap((i) => (i.file ? i.file : []))
  if (files.length > 0) {
    files.forEach((file) => formData.append('formFiles', file))
  } else {
    formData.append('formFiles', '')
  }
  formData.append('insertDto', JSON.stringify(insertDto))
  return formData
}

// 打开或关闭弹窗
const detailVisible = shallowRef<boolean>(false)
const closeDialog = () => (detailVisible.value = false)
const openDialog = async (params: string) => {
  await IndexCheckPayment({ dtoStr: params }).then((res) => {
    const { code, data } = res
    if (code === 200) {
      const { account, baseInfo, details, expenseTypeSetect } = data
      const newAccount = account.map((i: CommonRowData) => {
        // 数字 0 变成 null
        return { ...i, cost_type_id: i.cost_type_id ? i.cost_type_id : null }
      })
      baseInfoData.value = baseInfo ?? []
      accountingData.value = newAccount ?? []
      payDetailData.value = details ?? []
      accessoryData.value = [...emptyAccessory] // 清空附件
      costTypeList.value = transformObject(expenseTypeSetect) ?? []
      bottomContentWidth.value = payDetailColumnsConfig.reduce((a, b) => {
        return b.width ? a + Number(b.width.replace('px', '')) : a
      }, 0)
      detailVisible.value = true
    }
  })
}
function transformObject(obj: Record<number, string>) {
  return Object.entries(obj).map(([key, value]) => ({
    label: value,
    value: Number(key)
  }))
}

defineExpose({ openDialog })
</script>

<style scoped lang="scss">
@import '@/styles/page-detail.scss';
@include pageDetail;
</style>
