<template>
  <el-dialog v-model="dialogVisible" title="日记账明细" width="500" :append-to-body="true" draggable>
    <el-select-v2 v-model="docEntry" :options="docEntryList" placeholder="请选择关联单据" size="small" class="c-mb10 c-w240" clearable />
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleTabsClick" v-loading="loading">
      <el-tab-pane label="总账科目" name="acctName">
        <c-search v-model:data="queryList1" :config="searchConfig1" />
        <c-table ref="table" v-model:data="newAcctList" :tableConfig="tableConfig1" :columnsConfig="columnsConfig1" style="height: 400px"></c-table>
      </el-tab-pane>
      <el-tab-pane label="业务伙伴" name="cardName">
        <c-search v-model:data="queryList2" :config="searchConfig2" />
        <c-table
          ref="table"
          v-model:data="newCardCodeList"
          :tableConfig="tableConfig2"
          :columnsConfig="columnsConfig2"
          style="height: 400px"
        ></c-table>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <div class="c-flex-center">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="warning" @click="handlerSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { shallowRef } from 'vue'
import type { AcctList, CardCodeList, RowData } from '@/views/finance/bankStatements/types'
import { type TabsPaneContext, ElMessage } from 'element-plus'
import { useSelectList } from '../hooks/common/useSelectList'

const emit = defineEmits(['confirm'])

const loading = shallowRef<boolean>(false)
const queryList1 = shallowRef<QueryList>({ queryValue: '' })
const queryList2 = shallowRef<QueryList>({ queryValue: '' })
const activeName = shallowRef<string>('acctName')
const acctList = shallowRef<AcctList[]>([])
const newAcctList = shallowRef<AcctList[]>([])
const cardCodeList = shallowRef<CardCodeList[]>([])
const newCardCodeList = shallowRef<CardCodeList[]>([])
const dialogVisible = shallowRef<boolean>(false)
const docEntry = shallowRef<string>('')
const docEntryList = shallowRef<SelectList[]>([])

// 切换 tab 时清空选中行
const handleTabsClick = (value: TabsPaneContext) => clearSelectedRow(value.paneName as string)
function clearSelectedRow(value: string) {
  if (['all', 'acctName'].includes(value)) newCardCodeList.value.forEach((i) => (i.checked = false))
  if (['all', 'cardCode'].includes(value)) newAcctList.value.forEach((i) => (i.checked = false))
}

// 日记账详情表格新增数据
const handlerSubmit = () => {
  const data =
    activeName.value === 'acctName'
      ? newAcctList.value.flatMap((i) => (i.checked ? { code: i.acctCode, name: i.acctName } : []))
      : newCardCodeList.value.flatMap((i) => (i.checked ? { code: i.cardCode, name: i.cardName } : []))
  if (data.length > 0) {
    const numberDocEntry = docEntry.value ? Number(docEntry.value) : null
    const docType = docEntry.value ? docEntryList.value.find((i) => i.value === docEntry.value)?.docType : null
    const newData = data.map((item) => ({
      ...item,
      docEntry: numberDocEntry,
      docType,
      debitAmt: '',
      creditAmt: '',
      remark: '',
      checked: true
    }))
    emit('confirm', newData)
    dialogVisible.value = false
  } else {
    ElMessage({ type: 'warning', message: '请选择总账科目或者业务伙伴' })
  }
}

// 参数配置
const searchConfig1 = [
  {
    name: 'input',
    prop: 'queryValue',
    attr: { placeholder: '科目号/名称' },
    style: { width: '200px' },
    on: { change: () => filterList('acctCode') }
  },
  {
    name: 'button',
    text: '查询',
    attr: { type: 'primary', iconName: 'btn-search' },
    on: { click: () => filterList('acctCode') }
  }
]
const tableConfig1 = { type: 'virTable' }
const columnsConfig1 = [
  { key: 'selection' },
  { dataKey: 'acctCode', title: '科目号', width: 100 },
  { dataKey: 'acctName', title: '科目名称', width: 300 }
]
const searchConfig2 = [
  {
    name: 'input',
    prop: 'queryValue',
    attr: { placeholder: '业务伙伴代码/名称' },
    style: { width: '200px' },
    on: { change: () => filterList('cardCode') }
  },
  {
    name: 'button',
    text: '查询',
    attr: { type: 'primary', iconName: 'btn-search', iconColor: 'transparent', iconStroke: '#000' },
    on: { click: () => filterList('cardCode') }
  }
]
const tableConfig2 = { type: 'virTable' }
const columnsConfig2 = [
  { key: 'selection' },
  { dataKey: 'cardCode', title: '业务伙伴代码', width: 100 },
  { dataKey: 'cardName', title: '业务伙伴名称', width: 200 },
  { dataKey: 'balance', title: '业务伙伴金额', width: 100, key: 'price' }
]

// 打开弹窗
type OpenDialogParams = {
  docEntryList: SelectList[]
  selectData: RowData[]
}
const openDialog = async (params: OpenDialogParams) => {
  loading.value = true
  dialogVisible.value = true
  // 获取下拉列表数据
  await getSelectList()
  // 配置初始化参数
  queryList2.value = { queryValue: params.selectData?.[0]?.inOutAccountName ?? '' }
  docEntryList.value = params.docEntryList
  // 自动筛选表格数据
  filterList('acctCode')
  filterList('cardCode')
  clearSelectedRow('all')
  loading.value = false
}
function filterList(type: 'acctCode' | 'cardCode') {
  let filterArg = ''
  if (type === 'cardCode') {
    filterArg = queryList2.value.queryValue.trim()
    newCardCodeList.value =
      cardCodeList.value?.filter((i) => {
        return filterArg && i ? i.cardCode?.includes(filterArg) || i.cardName?.includes(filterArg) : true
      }) ?? []
  } else {
    filterArg = queryList1.value.queryValue.trim()
    newAcctList.value =
      acctList.value?.filter((i) => {
        return filterArg && i ? i.acctCode?.includes(filterArg) || i.acctName?.includes(filterArg) : true
      }) ?? []
  }
}
async function getSelectList() {
  const { getJournalAcctList, getCardCodeList } = useSelectList()
  acctList.value = await getJournalAcctList()
  cardCodeList.value = await getCardCodeList()
}

defineExpose({ openDialog })
</script>

<style scoped lang="scss">
:deep(.el-tabs__item) {
  &.is-active,
  &:hover {
    color: var(--tc-global-yellow) !important;
  }
}
</style>
