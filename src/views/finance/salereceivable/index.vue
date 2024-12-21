<template>
  <div class="c-flex-column">
    <div class="c-relative c-flex-between">
      <div class="c-flex-between c-w100p">
        <div class="c-flex-ycenter">
          <c-search v-model:data="queryList" :config="queryConfig" />
          <el-tooltip placement="right-start">
            <template #content>
              -SE应收余额=发货金额-退货金额-收款金额 <br />
              -应收SE各类情况处理方式： <br />
              1.退换——业务员跟进退货和系统流程 <br />
              2.收款错误——业务员找出纳更新收款信息 <br />
              3.欠款——业务员自行跟进处理 <br />
              4.实际不收费的但系统做了收费——业务员自行处理 <br />
              5.重复下单的、转单收款——业务员自行处理 <br />
              6.税差、汇率差、小金额赠送——财务批量处理中 <br />
              <br />
              非以上原因的特殊情况，请联系财务陈媛简要说明【SE单号、异常原因】
            </template>
            <Icon name="btn-question" color="var(--tc-global-gray)" size="15" class="c-cursor-p c-ml5 c-mb6" />
          </el-tooltip>
        </div>
        <Icon name="btn-remark" color="var(--tc-global-gray)" size="13" class="c-cursor-p c-mr35 c-mb6" @click="addBatchRemark" />
      </div>
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
    <RemarkDrawer ref="remarkDrawer" @updateRowData="updateRowData" />
    <UploadDialog ref="uploadDialog" @success="initSearch" />
    <ClientReconciliationDialog ref="clientReconciliationDialog" />
  </div>
</template>

<script setup lang="tsx">
import { onMounted } from 'vue'
import type { RowData } from './types'
import RemarkDrawer from '@/views/finance/common/components/RemarkDrawer.vue'
import { useMessage, afterMessageConnect, messageInfo } from '@/hooks/useMessage'
import { keepAliveOption } from '@/utils/generateRoutes'
import { useSearch, useTable, useFooter } from './hooks/useCommon'
import { GetSalesOrderGroupBySaleMen, GetOrderOrgTypeCount, GetSalesOrderDueList } from './request'
import { deepClone } from '@/utils/common'
import { setIndicatorList } from '@/utils/setIndicatorList'
import { jsonToExcelHandler, transformToExcelData } from '@/hooks/useExcel'
import UploadDialog from '@/components/uploadDialog/index.vue'
import ClientReconciliationDialog from '@/views/finance/common/components/ClientReconciliationDialog.vue'

// keep-alive
defineOptions({ name: keepAliveOption.salereceivable })

// postMessage
useMessage('salereceivable')

// hooks
export type HooksParams = {
  initSearch: () => void
  onSearch: (verifyInfo: SearchVerifyInfo) => void
  exportTable?: () => void
}
const hooksParams = { onSearch, initSearch, exportTable }
const { queryList, queryConfig, oidcinfo } = useSearch(hooksParams)
const {
  agTable,
  tableData,
  tableConfig,
  columns,
  loading,
  selectedInfo,
  currentPageIndex,
  pageLimit,
  isTreeDataMode,
  serverSortHandler,
  addBatchRemark
} = useTable(hooksParams)
const { footerData, footerOptions, extraInfo, bottomBtnType, footerHandler } = useFooter(hooksParams)

// 页面数据初始化
onMounted(() => {
  if (!Array.isArray(queryList.value.invoiceBal)) {
    queryList.value.invoiceBal = []
  }

  setIndicatorList(oidcinfo)
  afterMessageConnect(() => {
    if (messageInfo) {
      const { data } = messageInfo
      if (data && typeof data === 'object') {
        // 拿到从 BI 传过来的查询参数
        queryList.value = { ...queryList.value, ...data }
      }
    }
    initSearch()
  })
})

function initSearch() {
  onSearch('init')
}
type SearchVerifyInfo = 'init' | 'addData' | 'pagination'
async function onSearch(verifyInfo: SearchVerifyInfo) {
  verifyInfo === 'init' && (currentPageIndex.value = 1)
  verifyInfo === 'addData' && currentPageIndex.value++
  const res = await getTableData()
  const { code, data, sum } = res
  const count = res.count!
  if (code === 200) {
    extraInfo.value = { count, sum }
    const callback = new Map([
      [verifyInfo === 'addData', () => agTable.value!.applyTransaction(data)],
      [['init', 'pagination'].includes(verifyInfo), () => (tableData.value = data)]
    ]).get(true)
    callback && callback()
  }
  getOrderOrgTypeCount()
}
// 获取表格数据
async function getTableData() {
  try {
    loading.value = true
    const params = assembleParams()
    const Api = isTreeDataMode.value ? GetSalesOrderGroupBySaleMen : GetSalesOrderDueList
    return await Api(params)
  } finally {
    loading.value = false
  }
}
// 更新表格行数据
function updateRowData(rowData: RowData[]) {
  rowData.forEach((item) => {
    const rowNode = agTable.value!.getRowNode(item.id) // 根据唯一标识 id 匹配
    rowNode.updateData(item) // 更新行数据
    agTable.value!.gridApi.refreshCells({ force: true, rowNodes: [rowNode] }) // 强行刷新行
  })
}
// 组装参数
function assembleParams() {
  const { cardCode, cardName, slpName } = queryList.value
  const params = {
    ...queryList.value,
    invoiceBal: queryList.value.invoiceBal.join(','),
    cardCode: cardCode?.trim(),
    cardName: cardName?.trim(),
    slpName: slpName?.trim(),
    createDate_Start: footerData.value.time![0] ?? '',
    createDate_End: footerData.value.time![1] ?? '',
    page: currentPageIndex.value,
    limit: pageLimit.value
  }
  return params
}
// 获取部门小红点数值
function getOrderOrgTypeCount() {
  GetOrderOrgTypeCount().then((res) => {
    const { code, data } = res
    if (code === 200) {
      const obj = deepClone(bottomBtnType.value)
      for (const key in bottomBtnType.value) {
        obj[key].qty = data[obj[key].qtyKey]
      }
      bottomBtnType.value = obj
    }
  })
}
// 导出表格
function exportTable() {
  const tableData = agTable.value!.instance.getRowData()
  const excelData = transformToExcelData({ data: tableData, columns: columns.value, isNeedIndex: true })
  jsonToExcelHandler(excelData, '销售应收.xls')
}
</script>

<style scoped lang="scss"></style>
