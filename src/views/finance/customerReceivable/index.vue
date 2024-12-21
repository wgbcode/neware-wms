<template>
  <div class="c-relative">
    <div class="c-flex-column c-h100p c-w100p">
      <div class="c-relative c-flex-between">
        <c-search v-model:data="queryList" :config="queryConfig" />
        <c-column-filter v-model:data="columns" />
      </div>
      <c-ag-table
        ref="agTable"
        :config="tableConfig"
        :data="tableData"
        :columns="columns"
        :loading="loading"
        v-model:selectedInfo="selectedInfo"
        @scrollToEnd="onSearch('addData')"
        @customServerSort="serverSortHandler"
        class="c-flex-1"
      />
      <c-footer v-model:data="footerData" :options="footerOptions" @update="footerHandler" />
    </div>
    <Detail ref="detail" />
  </div>
</template>

<script setup lang="tsx">
import { useMessage } from '@/hooks/useMessage'
import { keepAliveOption } from '@/utils/generateRoutes'
import { useSearch, useTable, useFooter } from './hooks/useCommon'
import { setIndicatorList } from '@/utils/setIndicatorList'
import { onMounted } from 'vue'
import { GetClientDueList } from './request'
import Detail from './components/Detail.vue'
import { jsonToExcelHandler, transformToExcelData } from '@/hooks/useExcel'

// keep-alive
defineOptions({ name: keepAliveOption.customerReceivable })

// postMessage
useMessage('customerReceivable')

// hooks
export type HooksParams = {
  initSearch: () => void
  onSearch: (verifyInfo: SearchVerifyInfo) => void
  exportTable?: () => void
}
const hooksParams = { onSearch, exportTable, initSearch }
const { queryList, queryConfig, oidcinfo } = useSearch(hooksParams)
const { agTable, tableData, tableConfig, columns, loading, selectedInfo, currentPageIndex, pageLimit, serverSortHandler } = useTable(hooksParams)
const { footerData, footerOptions, extraInfo, footerHandler } = useFooter(hooksParams)

// 页面数据初始化
onMounted(() => {
  initSearch()
  setIndicatorList(oidcinfo)
})
function initSearch() {
  onSearch('init')
}
type SearchVerifyInfo = 'init' | 'addData' | 'pagination'
async function onSearch(verifyInfo: SearchVerifyInfo) {
  verifyInfo === 'init' && (currentPageIndex.value = 1)
  verifyInfo === 'addData' && currentPageIndex.value++
  const res = await getTableData()
  const { code, data, count, extraData } = res
  if (code === 200) {
    extraInfo.value = { count, sum: extraData }
    const callback = new Map([
      [verifyInfo === 'addData', () => agTable.value!.applyTransaction(data)],
      [['init', 'pagination'].includes(verifyInfo), () => (tableData.value = data)]
    ]).get(true)
    callback && callback()
  }
}
// 获取表格数据
async function getTableData() {
  try {
    loading.value = true
    const params = assembleParams()
    return await GetClientDueList(params)
  } finally {
    loading.value = false
  }
}
// 组装参数
function assembleParams() {
  const params: QueryList = {
    ...queryList.value,
    page: currentPageIndex.value,
    limit: pageLimit.value
  }
  const keys = ['receivableAmount', 'contractAmount', 'recieveAblePercnt', 'overDuePercent']
  keys.forEach((key) => {
    params[`${key}LowLimit`] = params[key]?.[0] || ''
    params[`${key}HighLimit`] = params[key]?.[1] || ''
    delete params[key]
  })
  return params
}
// 导出表格
function exportTable() {
  const tableData = agTable.value!.instance.getRowData()
  const excelData = transformToExcelData({ data: tableData, columns: columns.value, isNeedIndex: true })
  jsonToExcelHandler(excelData, '客户应收.xls')
}
</script>

<style scoped lang="scss"></style>
