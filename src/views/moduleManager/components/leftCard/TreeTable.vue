<template>
  <c-table :data="data" :tableConfig="tableConfig" :columnsConfig="columnsConfig">
    <template #name="scope">
      <div style="display: flex; align-items: center">
        <el-radio v-if="scope.parentId" :model-value="radioId" :label="scope.id" size="large" @change="radioChange(scope)">{{ scope.name }}</el-radio>
        <span v-else> {{ scope.name }}</span>
      </div>
    </template>
  </c-table>
</template>

<script setup lang="tsx">
import { type PropType, shallowRef } from 'vue'
import { type Modules } from '@/hooks/useSysBaseData'

defineProps({
  data: {
    type: Array<Modules>,
    required: true
  }
})

// 单选框
const radioId = shallowRef<string>('')
const selectedRow = defineModel('selectedRow', { type: Object as PropType<Modules> })
const radioChange = (row: Modules) => {
  radioId.value = row?.id ?? ''
  selectedRow.value = row
}

// 表格
const tableConfig = { height: '100%', 'row-key': 'id', stripe: false, 'default-expand-all': false, on: { 'current-change': radioChange } }
const columnsConfig = [
  { label: '模块名称', prop: 'name', width: '200', slotName: 'name' },
  { label: '模块标识', prop: 'code', width: '150' },
  { label: 'URL', prop: 'url' }
]
</script>

<style scoped lang="scss">
:deep(.cell) {
  display: flex;
  align-items: center;
}

:deep(.el-radio.el-radio--large) {
  height: 20px;
}
</style>
