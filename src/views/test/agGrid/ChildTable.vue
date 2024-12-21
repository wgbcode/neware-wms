<template>
  <div class="c-flex-column c-ml60 c-p5" :style="{ height }">
    <c-ag-table
      ref="agTable"
      :config="tableConfig"
      :data="data.fullWidthRowData"
      :columns="columns"
      class="c-flex-1"
      style="width: 545px"
      :loading="loading"
      @updateParentData="updateParentData"
    />
  </div>
</template>

<script setup lang="tsx">
import { shallowRef, useTemplateRef } from 'vue'
import type { ICellRendererParams } from 'ag-grid-community'

// 点击行数据会自动传入
export type UpdateParentParams = { id: number; data: AnyObject[] }
interface Props {
  params: ICellRendererParams
  // 用于在子表数据更新时，通知父表同步更新数据
  updateParentData: ({ id, data }: UpdateParentParams) => void
}
const props = defineProps<Props>()
const { data } = props.params
const height = (data.fullWidthRowData.length + 2) * 20 + 'px'
// console.log('拿到的点击行数据：', props.params)

interface RowData {
  [key: string]: any
}
const loading = shallowRef<boolean>(false)
const agTable = useTemplateRef<AgGridInstance<RowData>>('agTable')
const tableConfig = { autoSelectRowByChecked: true }
const columns = shallowRef([
  { type: 'checked', pinned: 'left' },
  {
    headerName: '测试1',
    field: 'test1',
    width: 100,
    autoMergeCol: true // 自动合并列
  },
  { headerName: '测试2', field: 'test2', width: 100, autoMergeCol: true },
  { headerName: '测试3', field: 'test3', width: 100, autoMergeCol: true },
  { headerName: '测试4', field: 'test4', width: 100 },
  { headerName: '测试5', field: 'test5', width: 100 }
])
</script>

<style scoped lang="scss"></style>
