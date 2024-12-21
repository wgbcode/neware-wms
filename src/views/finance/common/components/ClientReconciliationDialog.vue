<template>
  <el-dialog v-model="dialogVisible" title="对账单" :width="750" draggable>
    <c-ag-table ref="agTable" :config="tableConfig" :data="tableData" :columns="columns" :loading="tableLoading" style="height: 300px" />
  </el-dialog>
</template>

<script lang="tsx" setup>
import { shallowRef, defineComponent } from 'vue'
import { GetClientReconciliationFiles } from '../js/request'
import Icon from '@/components/global/dynamicImport/icon/index.vue'
import type { ValueFormatterParams } from 'ag-grid-community'

interface RowData {
  filePath: string
  fileName: string
  fileType: string
  creater: string
  createrName: string
  createDate: string
  saleOrderIds: number[]
}
const dialogVisible = shallowRef<boolean>(false)
const tableLoading = shallowRef<boolean>(false)
const tableData = shallowRef<RowData[]>([])
const tableConfig = {}
const fileNameComp = defineComponent({
  props: { params: { type: Object, required: true } },
  setup(props) {
    const { fileName, fileType, filePath } = props.params.data
    const target = fileType.includes('pdf') || fileType.includes('img') ? '_blank' : '_self'
    return () => (
      <div class="c-flex-ycenter">
        <a href={filePath} target={target} class="c-flex-center">
          <Icon name="arrow" color="var(--tc-brand)" size="12" class="c-mr2 c-mb1 c-cursor-p" />
        </a>
        <span>{fileName}</span>
      </div>
    )
  }
})
const saleOrderIdsFormatter = (params: ValueFormatterParams) => {
  return params.value ? params.value.map((i: number) => 'SE-' + i).join(',') : ''
}
const columns = shallowRef([
  { type: 'index', pinned: 'left' },
  { headerName: '文件名称', field: 'fileName', width: 150, cellRenderer: fileNameComp },
  { headerName: '文件类型', field: 'fileType', width: 120 },
  { headerName: '申请人', field: 'createrName', width: 120 },
  { headerName: '创建时间', field: 'createDate', width: 130, formatType: 'dateTime' },
  { headerName: '销售订单', field: 'saleOrderIds', width: 150, valueFormatter: saleOrderIdsFormatter }
])
// 传 cardCode 根据业务伙伴代码查询
// 传 orderId 和 sboId 根据销售订单号查询
interface QueryParams {
  cardCode?: string // 业务伙伴代码
  orderId?: number // 销售单号
  sboId?: number // 账套信息
}
const openDialog = (queryParams: QueryParams) => {
  dialogVisible.value = true
  tableLoading.value = true
  GetClientReconciliationFiles(queryParams)
    .then((res) => {
      const { code, result } = res
      if (code === 200) {
        tableData.value = result
      }
    })
    .finally(() => {
      tableLoading.value = false
    })
}
defineExpose({ openDialog })
</script>

<style scoped lang="scss"></style>
