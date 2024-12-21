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
              <label class="label">入账金额合计: </label>
              <span class="value">{{ numberFormat(inTotalAmt) }}</span>
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
import type { AcceptMoneyLinkOrderRow, BaseInfoRow, JournalsDetailRow, RowData } from '@/views/finance/bankStatements/types'
import DetailDialog from './components/DetailDialog.vue'
import { numberFormat } from '@/utils/format'
import { GetRelatedDocs } from '@/views/finance/bankStatements/request'
import { useBaseInfo, useJournalsDetail, useLinkOrder, useDialog, useGlobal, useSelectList } from './hooks/acceptMoney/useCommon'
import type { ModeMap } from '../RightCard.vue'
import { shallowRef, useTemplateRef, nextTick, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps(['indicator']) // 左边列表查询：标识字段
const emit = defineEmits(['updateLeftCardData'])

// 表格数据、表格实例
const linkOrderTableData = shallowRef<AcceptMoneyLinkOrderRow[]>([])
const baseInfoTableData = shallowRef<BaseInfoRow[]>([])
const journalsDetailTableData = shallowRef<JournalsDetailRow[]>([])
const linkOrderAgTable = useTemplateRef<AgGridInstance<AcceptMoneyLinkOrderRow> | null>('linkOrderAgTable')
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
const { loading, selectData, modeMap, curComponent, activeNames, queryList, waterTotalAmt, waterIds, getNewJournalsDetailTableData, submitData, serverSortHandler } =
  useGlobal(hookParams)
const { searchConfig, linkOrderTableConfig, linkOrderColumns, inTotalAmt, linkOrderSelectionHandler, defaultExpandFullWidthRowIndex } =
  useLinkOrder(hookParams)
const { baseInfoTableConfig, baseInfoColumns, canChangeCurrency, acctList, cardCodeList, currencyList, indicatorList } = useBaseInfo(hookParams)
const { journalsDetailTableConfig, journalsDetailColumns } = useJournalsDetail(hookParams)
const { openDetailDialog, addJournalsDetail, deleteJournalsDetail } = useDialog(hookParams)

// 组件数据初始化
type InitData = {
  currentSelectData: RowData[] // 左侧表格选中数据
  currentModeMap: ModeMap // 用于判断当前的 mode，新增 | 付款 | 收款
  currentCurComponent: 'acceptMoney' | 'payMoney' // 用于判断当前用户操作的模块，付款 | 收款
}
const { getAcctList, getCurrencyList, getIndicatorList, getCardCodeList } = useSelectList()
async function initData(params: InitData) {
  // 设置默认值
  const { currentSelectData, currentModeMap, currentCurComponent } = params
  selectData.value = currentSelectData
  modeMap.value = currentModeMap
  curComponent.value = currentCurComponent
  canChangeCurrency.value = false // 默认币种不可选择
  queryList.value = {
    receiptAccount: selectData.value[0]?.inOutAccountName ?? '',
    receiptAmount: selectData.value[0]?.inAmount ?? null,
    indicator: props.indicator ?? '' // 标识全都按照左边标识搜索框的值来
  }
  // 判断是否是新增模式
  if (currentModeMap.add) {
    linkOrderTableData.value = []
    baseInfoTableData.value = [{ id: 0, currency: 'RMB', rate: 1, payAmount: 0, docDate: dayjs().format('YYYY.MM.DD') }]
    journalsDetailTableData.value = []
  } else {
    onSearch() // 获取付款模块数据
  }
  // 获取下拉列表数据
  try {
    const [acctListRes, currencyListRes, indicatorListRes, cardCodeListRes] = await Promise.all([
      getAcctList(currentSelectData),
      getCurrencyList(),
      getIndicatorList(),
      getCardCodeList()
    ])
    acctList.value = acctListRes
    currencyList.value = currencyListRes
    indicatorList.value = indicatorListRes
    cardCodeList.value = cardCodeListRes
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
function onSearch() {
  loading.value = true
  const params = { ...queryList.value, id: waterIds.value }
  GetRelatedDocs(params)
    .then(async (res) => {
      const { code, data } = res
      if (code === 200 && data) {
        const { receiptRelatedDocResps, baseInfo } = data
        // 配置跨网格行组件默认展开 index，勾选的自动展开
        defaultExpandFullWidthRowIndex.value = receiptRelatedDocResps.flatMap((item, index) => {
          return item.checked ? index : []
        })
        await nextTick()
        baseInfoTableData.value = baseInfo ? [baseInfo] : [{ id: 0, currency: 'RMB', rate: 1, payAmount: 0, docDate: dayjs().format('YYYY.MM.DD') }]
        linkOrderTableData.value = receiptRelatedDocResps.map((i: AcceptMoneyLinkOrderRow) => {
          return { ...i, fullWidthRowData: i.invoices ?? [] }
        })
        const tableData = linkOrderTableData.value.reduce<JournalsDetailRow[]>((pre, next) => {
          if (next.checked) {
            next.journalDetailResps?.forEach((item) => {
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
