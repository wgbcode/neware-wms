<template>
  <el-dialog v-model="dialogVisible" title="收款明细" :width="750" draggable>
    <DetailContent :options="detailOption">
      <template #baseInfo>
        <c-table v-model:data="baseInfoData" :tableConfig="baseInfoConfig" :columnsConfig="baseInfoColumnsConfig" />
      </template>
      <template #accounting>
        <c-table v-model:data="accountingData" :tableConfig="accountingConfig" :columnsConfig="accountingColumnsConfig" />
      </template>
      <template #payDetail>
        <c-table v-model:data="payDetailData" :tableConfig="payDetailConfig" :columnsConfig="payDetailColumnsConfig" />
      </template>
    </DetailContent>
    <template #footer>
      <div class="c-flex-center">
        <template v-for="(item, index) in btnOption">
          <el-button v-if="item.show" :key="index" :type="item?.type" @click="item.click" :loading="item?.loading" class="c-mx60">
            <Icon v-show="!item?.loading" :name="item.iconName" size="13" class="c-mr4" :class="item.iconClass" />
            <span>{{ item.text }}</span>
          </el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { shallowRef, computed } from 'vue'
import DetailContent from '@/components/detailContent/index.vue'
import { GetRecepitsInfos, ExportReceiptPdf } from '../request'

let cacheData: AnyObject | null = null
const emit = defineEmits(['search'])

// 模块配置
const detailOption = [
  { defaultShow: true, index: 1, title: '基本信息', contentSlot: 'baseInfo' },
  { defaultShow: true, index: 2, title: '会计', contentSlot: 'accounting' },
  { defaultShow: true, index: 3, title: '付款明细', contentSlot: 'payDetail' }
]

// 基本信息
const baseInfoData = shallowRef<AnyObject[]>([])
const baseInfoConfig = { 'highlight-current-row': false }
const baseInfoColumnsConfig = [
  { label: '业务伙伴代码', prop: 'cardCode', width: '100' },
  { label: '业务伙伴名称', prop: 'cardName', width: '200' },
  { label: '科目余额', prop: 'balance', width: '100', slotName: 'price' },
  { label: '收款日期', prop: 'docDate', width: '100', slotName: 'date' },
  { label: '备注', prop: 'remarks', width: '205' }
]

// 会计
const accountingData = shallowRef<AnyObject[]>([])
const accountingConfig = { 'highlight-current-row': false }
const accountingColumnsConfig = computed(() => {
  return [
    { label: '总账科目', prop: 'accountCode', width: '100' },
    { label: '币种', prop: 'docCurr', width: '100' },
    { label: '汇率', prop: 'docRate', width: '100' },
    { label: '收款金额', prop: 'docTotalFC', width: '100', slotName: 'price' },
    { label: '收款金额（本币）', prop: 'docTotal', width: '120', slotName: 'price' }
  ]
})

// 付款明细
const payDetailData = shallowRef<AnyObject[]>([])
const payDetailConfig = { 'highlight-current-row': false }
const payDetailColumnsConfig = [
  { label: '单据编号', prop: 'docEntryStr', width: '100' },
  { label: '创建日期', prop: 'createDate', width: '100', slotName: 'date' },
  { label: '关联销售单号', prop: 'salesDocEntryStr', width: '100' },
  { label: '订单金额', prop: 'docTotal', width: '100', slotName: 'price' },
  { label: '到期余额', prop: 'docBal', width: '100', slotName: 'price' },
  { label: '本期收款', prop: 'sumApplied', width: '100', slotName: 'price' }
]

// 按钮
const btnOption = computed(() => {
  return [
    { text: '关闭', show: true, click: closeDialog, iconName: 'btn-close', iconClass: 'c-mb1' },
    { text: '打印', type: 'warning', show: true, click: print, iconName: 'btn-confirm', loading: btnLoading.value }
  ]
})
const print = () => {
  btnLoading.value = true
  const params: AnyObject = {}
  const keys = ['salesDocEntry', 'docEntry', 'cardCode', 'cardName', 'docDate', 'docTime', 'salesMan', 'remarks', 'accountCode', 'docTotal']
  keys.forEach((key) => cacheData && (params[key] = cacheData[key]))
  ExportReceiptPdf(params)
    .then((res) => {
      window.open(URL.createObjectURL(res))
      emit('search')
      dialogVisible.value = false
    })
    .finally(() => {
      btnLoading.value = false
    })
}

// 打开或关闭弹窗
const dialogVisible = shallowRef<boolean>(false)
const btnLoading = shallowRef<boolean>(false)
const closeDialog = () => (dialogVisible.value = false)
const openDialog = async (docEntry: number) => {
  await GetRecepitsInfos({ docEntry }).then((res) => {
    const { code, data } = res
    if (code === 200 && data) {
      cacheData = data
      const { salesDocEntry, receiptInfosDetails } = data
      baseInfoData.value = [data]
      accountingData.value = [data]
      payDetailData.value = receiptInfosDetails.map((i: AnyObject) => ({ ...i, salesDocEntry }))
      dialogVisible.value = true
    }
  })
}

defineExpose({ openDialog })
</script>

<style scoped lang="scss"></style>
