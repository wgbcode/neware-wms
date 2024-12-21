<template>
  <div class="c-h100p" v-loading="loading">
    <el-collapse v-model="activeNames">
      <el-collapse-item name="linkOrder">
        <!-- 自定义面板标题 -->
        <template #title>
          <ul class="c-flex-ycenter">
            <li class="title">1. 关联单据</li>
            <li class="c-ml15 c-mt1">
              <label class="label">流水合计: </label>
              <span class="value">{{ numberFormat(waterTotalAmt) }}</span>
            </li>
            <li class="c-ml15 c-mt1">
              <label class="label">出账金额合计: </label>
              <span class="value">{{ numberFormat(outTotalAmt) }}</span>
            </li>
          </ul>
        </template>
        <c-search v-model:data="queryList" :config="searchConfig" />
        <c-ag-table
          ref="linkOrderAgTable"
          :config="linkOrderTableConfig"
          :data="linkOrderTableData"
          :columns="linkOrderColumns"
          style="height: 250px"
          @customSelectionChanged="linkOrderSelectionHandler"
          @customServerSort="serverSortHandler"
        />
      </el-collapse-item>
      <el-collapse-item title="2. 基本信息" name="baseInfo">
        <c-ag-table ref="baseInfoAgTable" :config="baseInfoTableConfig" :data="baseInfoTableData" :columns="baseInfoColumns" style="height: 60px" />
      </el-collapse-item>
      <el-collapse-item name="journalsDetail">
        <!-- 自定义面板标题 -->
        <template #title>
          <ul class="c-flex-ycenter">
            <li class="c-fw700">3. 日记账明细</li>
            <li class="c-ml15">
              <el-button type="warning" @click.stop="openDetailDialog" style="height: 18px">
                <Icon name="add" color="black" size="13" />
              </el-button>
              <el-button type="warning" @click.stop="deleteJournalsDetail" style="height: 18px">
                <Icon name="delete2" color="red" size="13" />
              </el-button>
            </li>
          </ul>
        </template>
        <c-ag-table
          ref="journalsDetailAgTable"
          :config="journalsDetailTableConfig"
          :data="journalsDetailTableData"
          :columns="journalsDetailColumns"
          style="height: 150px"
        />
      </el-collapse-item>
    </el-collapse>
    <DetailDialog ref="detailDialog" :selectData="selectData" @confirm="addJournalsDetail" />
  </div>
</template>

<script lang="tsx" setup>
import type { RowData, JournalsDetailRow, BaseInfoRow, PayMoneyLinkRow } from '@/views/finance/bankStatements/types'
import DetailDialog from './components/DetailDialog.vue'
import { numberFormat } from '@/utils/format'
import { GetPaymentInfo } from '@/views/finance/bankStatements/request'
import { useBaseInfo, useJournalsDetail, useLinkOrder, useDialog, useGlobal, useSelectList } from './hooks/payMoney/useCommon'
import type { ModeMap } from '../RightCard.vue'
import { shallowRef, useTemplateRef, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps(['indicator']) // 左边列表查询：标识字段
const emit = defineEmits(['updateLeftCardData'])

// 表格数据、表格实例
const linkOrderTableData = shallowRef<PayMoneyLinkRow[]>([])
const baseInfoTableData = shallowRef<BaseInfoRow[]>([])
const journalsDetailTableData = shallowRef<JournalsDetailRow[]>([])
const linkOrderAgTable = useTemplateRef<AgGridInstance<PayMoneyLinkRow> | null>('linkOrderAgTable')
const baseInfoAgTable = useTemplateRef<AgGridInstance<BaseInfoRow> | null>('baseInfoAgTable')
const journalsDetailAgTable = useTemplateRef<AgGridInstance<JournalsDetailRow> | null>('journalsDetailAgTable')

// hooks
const hookParams = {
  emit,
  onSearch,
  linkOrderAgTable,
  baseInfoAgTable,
  journalsDetailAgTable,
  linkOrderTableData,
  baseInfoTableData,
  journalsDetailTableData
}
const { loading, modeMap, curComponent, activeNames, queryList, waterIds, waterTotalAmt, selectData, submitData, getNewJournalsDetailTableData, serverSortHandler } =
  useGlobal(hookParams)
const { searchConfig, outTotalAmt, linkOrderTableConfig, linkOrderColumns, linkOrderSelectionHandler } = useLinkOrder(hookParams)
const { baseInfoTableConfig, baseInfoColumns, canChangeCurrency, acctList, currencyList, indicatorList } = useBaseInfo(hookParams)
const { journalsDetailTableConfig, journalsDetailColumns } = useJournalsDetail(hookParams)
const { openDetailDialog, addJournalsDetail, deleteJournalsDetail } = useDialog(hookParams)

// 组件数据初始化
type InitData = {
  currentSelectData: RowData[] // 左侧表格选中数据
  currentModeMap: ModeMap // 用于判断当前的 mode，新增 | 付款 | 收款
  currentCurComponent: 'acceptMoney' | 'payMoney' // 用于判断当前用户操作的模块，付款 | 收款
}
const { getAcctList, getCurrencyList, getIndicatorList } = useSelectList()
async function initData(params: InitData) {
  // 设置默认值
  const { currentSelectData, currentModeMap, currentCurComponent } = params
  selectData.value = currentSelectData
  modeMap.value = currentModeMap
  curComponent.value = currentCurComponent
  canChangeCurrency.value = false // 默认币种不可选择
  queryList.value = { receiveAccountName: selectData.value[0]?.inOutAccountName ?? '', indicator: props.indicator ?? '' }
  // 判断是否是新增模式
  if (currentModeMap.add) {
    linkOrderTableData.value = []
    baseInfoTableData.value = [{ id: 0, currency: 'RMB', rate: 1, payAmount: 0, docDate: dayjs().format('YYYY.MM.DD') }]
    journalsDetailTableData.value = []
  } else {
    onSearch() // 获取付款模块数据
  }
  // 获取下拉列表数据
  acctList.value = await getAcctList(currentSelectData)
  currencyList.value = await getCurrencyList()
  indicatorList.value = await getIndicatorList()
}
function onSearch() {
  loading.value = true
  const params = { ...queryList.value, id: waterIds.value }
  GetPaymentInfo(params)
    .then((res) => {
      const { code, data } = res
      if (code === 200 && data) {
        const { paymentSummaryDtos, baseInfo } = data
        baseInfoTableData.value = baseInfo ? [baseInfo] : [{ id: 0, currency: 'RMB', rate: 1, payAmount: 0, docDate: dayjs().format('YYYY.MM.DD') }]
        // 关联单据只展示和基本信息中的币种一致的数据
        linkOrderTableData.value = paymentSummaryDtos
        const tableData = linkOrderTableData.value.reduce<JournalsDetailRow[]>((pre, next) => {
          if (next.checked) {
            next.journalDetailResps?.forEach((item: JournalsDetailRow) => {
              pre.push({ ...item, checked: true, addType: 'addByLinkOrder', docType: item.docType })
            })
          }
          return pre
        }, [])
        journalsDetailTableData.value = getNewJournalsDetailTableData(tableData)
      }
    })
    .finally(() => {
      loading.value = false
    })
}

// 监听标识变化
watch(() => props.indicator, (n) => {
  queryList.value.indicator = n
  
})
// 将组件方法暴露出去
defineExpose({ initData, submitData })
</script>
