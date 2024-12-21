<template>
  <div class="c-h100p">
    <el-tooltip :visible="visible" placement="left" popper-class="table-progress">
      <template #content>
        <el-table :data="tableData" style="width: 100%" :show-header="false" border>
          <el-table-column type="index" width="25" />
          <el-table-column prop="name" label="流程节点" />
          <el-table-column prop="createTime" label="创建时间" width="130" />
          <el-table-column prop="intervalTime" label="审批时长" width="75" align="right">
            <template #default="{ row }">
              <span :style="{ color: row.status.color }">
                {{ row.intervalTime }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <div
        v-if="tableData.length !== 0"
        class="c-relative c-h55p c-w100p c-flex-center"
        @mouseenter="visible = true"
        @mouseleave="visible = false"
        style="border: 2px solid black"
      >
        <i
          v-for="(item, index) in progressData"
          :key="index"
          class="c-h100p"
          :class="item.status.class"
          :style="{ width: item.width, height: '100%', borderLeft: '1px solid black' }"
        />
        <span class="c-absolute c-r0" style="color: var(--tc-highlight-text)">{{ getPercent() }}%</span>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup lang="tsx">
import { shallowRef, computed, type PropType } from 'vue'
import { formatSecondTime } from '@/utils/format'

export type ProgressBar = {
  auditTime: string | null
  createTime: string
  index: number
  intervalTime: number
  isCurrentNode: boolean
  isPass: boolean
  name: string
  value: number
}

const visible = shallowRef(false)
const props = defineProps({
  data: {
    type: Array<ProgressBar>,
    required: true
  },
  // 支持自定义
  matchKey: {
    type: Object as PropType<Record<string, keyof ProgressBar>>,
    default: () => ({
      name: 'name', // 审批节点名字
      createTime: 'createTime', // 创建时间
      intervalTime: 'intervalTime' // 间隔时长
    })
  },
  // 支持自定义。默认：x<=12 绿色，12<x<=24 黄色，x>24 红色
  dayRules: {
    type: Object as PropType<Record<string, number>>,
    default: () => ({
      firstRule: 12,
      secondRule: 24
    })
  }
})
const { name, createTime, intervalTime } = props.matchKey
const tableData = computed(() => {
  const result = props.data.map((item) => {
    return {
      ...item,
      name: item[name],
      createTime: item[createTime],
      intervalTime: formatSecondTime(Number(item[intervalTime]) * 1000),
      status: getStatus(Number(item[intervalTime]) / (60 * 60))
    }
  })
  return result
})
const filterData = computed(() => {
  const currentIndex = props.data.findIndex((item) => item.isCurrentNode)
  return currentIndex !== -1 ? props.data.slice(0, currentIndex) : props.data
})
const progressData = computed(() => {
  const fd = filterData.value
  const newData = fd.length > 8 ? fd.slice(-8) : fd // 最多只展示 8 个流程节点
  const result = newData.map((item) => {
    const width = (1 / newData.length) * 100 + '%'
    return { ...item, width, status: getStatus(Number(item[intervalTime]) / (60 * 60)) }
  })
  return result
})
function getPercent() {
  return props.data.length === 0 ? 0 : ((filterData.value.length / props.data.length) * 100).toFixed(0)
}
const STATUS_CLASSES = {
  EXECUTING: { class: 'executing', color: '#42BF39' }, // 执行中
  WARNING: { class: 'warning', color: '#F8B500' }, // 临期执行
  DELAYED: { class: 'delayed', color: '#EA3553' } // 延迟执行
}
function getStatus(intervalDays: number) {
  const { firstRule, secondRule } = props.dayRules
  if (intervalDays <= firstRule) {
    return STATUS_CLASSES.EXECUTING
  } else {
    return intervalDays <= secondRule ? STATUS_CLASSES.WARNING : STATUS_CLASSES.DELAYED
  }
}
</script>

<style lang="scss" scoped>
.executing {
  background-color: #0f8000;
}
.warning {
  background-color: #b26e00;
}
.delayed {
  background-color: #aa0025;
}
:deep(div.cell) {
  background-color: #262626;
}
</style>
