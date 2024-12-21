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
    <PayMoneyDetail ref="payMoneyDetail" @onSearch="onSearch" />
    <ReconciliationDialog ref="reconciliationDialog" @onSearch="onSearch" />
  </div>
</template>

<script setup lang="tsx">
import PayMoneyDetail from './components/PayMoneyDetail.vue'
import ReconciliationDialog from './components/ReconciliationDialog.vue'
import { useMessage } from '@/hooks/useMessage'
import { keepAliveOption } from '@/utils/generateRoutes'
import { useSearch, useTable, useFooter } from './hooks/useCommon'
import { setIndicatorList } from '@/utils/setIndicatorList'
import { onMounted } from 'vue'
import { GetFreightPayableInvoices } from './request'

// keep-alive
defineOptions({ name: keepAliveOption.freightPayable })

// postMessage
useMessage('freightPayable')

// hooks
export type HooksParams = {
  initSearch: () => void
  onSearch: (verifyInfo: SearchVerifyInfo) => void
}
const hooksParams = { onSearch, initSearch }
const { queryList, queryConfig, oidcinfo } = useSearch(hooksParams)
const { agTable, tableData, tableConfig, columns, loading, selectedInfo, currentPageIndex, pageLimit, serverSortHandler } = useTable(hooksParams)
const { footerData, footerOptions, extraInfo, footerHandler } = useFooter(hooksParams)

// 页面数据初始化
onMounted(() => {
  onSearch('init')
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
  const { code, data, count, sum } = res
  if (code === 200) {
    extraInfo.value = { count, sum }
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
    return await GetFreightPayableInvoices(params)
  } finally {
    loading.value = false
  }
}
// 组装参数
function assembleParams() {
  const params = {
    ...queryList.value,
    page: currentPageIndex.value,
    limit: pageLimit.value
  }
  return params
}
</script>
