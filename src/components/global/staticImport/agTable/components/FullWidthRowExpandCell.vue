<template>
  <div class="c-flex-ycenter">
    <Icon
      v-if="!hiddenIconOfEmptyFullWidthRow || (hiddenIconOfEmptyFullWidthRow && data.fullWidthRowData?.length > 0)"
      :name="expandStatus ? 'btn-detail-show' : 'btn-detail-hidden'"
      color="var(--tc-brand)"
      size="16"
      class="c-mr2 c-mb1 c-cursor-p"
      @click.stop="updateTableData"
    />
  </div>
</template>

<script setup lang="tsx">
import { shallowRef } from 'vue'
import type { ICellRendererParams } from 'ag-grid-community'

interface RowData {
  [key: string]: any
}

interface Props {
  params: ICellRendererParams
}

const props = defineProps<Props>()
const { data, api } = props.params
const expandStatus = shallowRef<boolean>(false)
const context = api.getGridOption('context') ?? {}
const { isDefaultExpandAllFullWidthRow, getParentInstance, hiddenIconOfEmptyFullWidthRow } = context ?? {}
expandStatus.value = typeof data.alreadyExpandFullWidthRow === 'boolean' ? data.alreadyExpandFullWidthRow : !!isDefaultExpandAllFullWidthRow
async function updateTableData() {
  const { id } = data
  let curTreeData: RowData[] = getParentInstance().getRowData() ?? []
  for (let i = 0; i < curTreeData.length; i++) {
    if (i == id) {
      // 通过 alreadyExpandFullWidthRow 判断跨网格行组件是展开状态还是隐藏状态
      if (curTreeData[i].alreadyExpandFullWidthRow) {
        curTreeData.splice(id + 1, 1) // 删除跨网格行组件
      } else {
        const fullWidthRowData = data.fullWidthRowData?.map((i: RowData) => ({ ...i, fullWidthRowId: id + 1 })) ?? []
        const newData = { ...data, fullWidthRowData }
        curTreeData.splice(id + 1, 0, { isFullWidthRow: true, ...newData, checked: false }) // 插入跨网格行组件
      }
      curTreeData[i].alreadyExpandFullWidthRow = !curTreeData[i].alreadyExpandFullWidthRow
      curTreeData.forEach((item, index) => (item.id = index))
      break
    }
  }
  api.setGridOption('rowData', curTreeData) // 更新表格数据
  api.ensureIndexVisible(id, 'middle') // TODO: 滚动到指定行(待优化)
  // debugger
}
</script>

<style scoped lang="scss"></style>
