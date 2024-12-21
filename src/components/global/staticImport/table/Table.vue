<template>
  <el-table ref="table" :data="data" v-bind="tableConfig" v-on="tableConfig.on" @row-dblclick="handlerRowDBClick"
    @row-click="handlerRowClick">
    <template v-for="(item, index) in columnsConfig" :key="index">
      <TableColumn :config="item" :data="data" v-bind="$attrs" :tableConfig="tableConfig">
        <!-- 插槽向下传递 -->
        <template v-for="(_, name) in $slots" #[name]="row">
          <slot :name="name" v-bind="row" />
        </template>
      </TableColumn>
    </template>
  </el-table>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import TableColumn from './TableColumn.vue'

const props = defineProps({
  data: {
    type: Array<AnyObject>,
    required: true
  },
  tableConfig: {
    type: Object,
    required: true
  },
  columnsConfig: {
    type: Object,
    required: true
  }
})
const table = shallowRef()
// 行点击事件
const handlerRowClick = (row: AnyObject) => {
  props.tableConfig.selectRowOnClick && table.value.toggleRowSelection(row) // 复选框点击选中
}
// 行双击事件
const handlerRowDBClick = (_row: AnyObject) => {
  table.value.setCurrentRow() // 单选框双击取消选中
}
defineExpose({ table })
</script>
