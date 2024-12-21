<template>
  <!-- 父元素高度需固定 -->
  <el-auto-resizer :key="tableKey" v-loading="loading">
    <template #default="{ height, width }">
      <el-table-v2
        ref="table"
        v-model:data="newData"
        v-bind="tableConfig"
        v-on="tableConfig?.on"
        :columns="columnsConfig"
        :width="width"
        :height="height"
        :row-height="20"
      >
        <!-- 自定义空元素渲染器 -->
        <template #empty>
          <div class="c-flex-center c-mt20" style="color: var(--el-text-color-secondary)">暂无数据</div>
        </template>
      </el-table-v2>
    </template>
  </el-auto-resizer>
</template>

<script setup lang="ts">
import useVModel from '@/hooks/useVModel'
import { shallowRef } from 'vue'

const props = defineProps({
  data: Array,
  tableConfig: Object,
  columnsConfig: Object
})

const loading = shallowRef(false)

// 数据改变时，通知根组件修改数据
const emit = defineEmits(['update:data'])
const newData = useVModel(props, 'data', emit)

// 重新渲染组件
const tableKey = shallowRef(0)
const reRender = () => (tableKey.value = Math.random())

// 把变量和方法暴露出去，让其它组件能获取和操作
const table = shallowRef(null)
defineExpose({ newData, reRender, loading, table })
</script>

<style scoped lang="scss">
// 合并列单元格样式
:deep(.el-table-v2__row-cell:has(.merge-first-cell)) {
  height: auto;
  align-self: flex-start;
}
:deep(.el-table-v2__row-cell:has(.merge-next-cell)) {
  height: 0;
  border: none !important;
}
</style>
