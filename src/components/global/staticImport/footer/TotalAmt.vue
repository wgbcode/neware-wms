<template>
  <ul class="totalAmt">
    <li>
      <label>当前条数: </label>
      <span class="value">{{ numberFormat(curCount, true) }} 条</span>
    </li>
    <li v-for="(item, index) in totalOption" :key="index">
      <label>{{ item.label + ': ' }}</label>
      <span class="value">{{ numberFormat(item.value) }}</span>
      <span v-if="item.percentKey" class="value">({{ item.percent + '%' }})</span>
    </li>
  </ul>
</template>

<script setup lang="tsx">
import { computed, type PropType } from 'vue'
import { numberFormat } from '@/utils/format.js'
import type { CompOption } from './index.vue'

interface TotalMap {
  key: string // 字段名
  label: string // 合计金额名
  value?: number // 总金额
  percentKey?: string // 百分比字段名（分母）
  percent?: null | number // 百分比
}
export interface TotalAmtOption {
  totalMap?: TotalMap[]
}

const props = defineProps({
  option: {
    type: Object as PropType<CompOption>,
    required: true
  }
})
const curCount = computed(() => {
  const { isSelectAll, selectData, totalCount } = props.option
  return isSelectAll ? totalCount : (selectData?.length ?? 0)
})
const totalOption = computed((): TotalMap[] => {
  const selectData = props.option.selectData ?? []
  const totalMap = props.option.totalAmtOption?.totalMap ?? []
  const keys = totalMap.map((i) => i.key)
  const percentKey = totalMap.flatMap((i) => (i.percentKey ? i.percentKey : [])) // 百分比（分母）
  const newKeys = [...new Set([...keys, ...percentKey])]
  const obj = selectData.reduce((a, b) => {
    newKeys.forEach((key: string) => {
      a[key] || (a[key] = 0)
      a[key] += b[key] ?? 0
    })
    return a
  }, {})
  const result = totalMap.map((i) => {
    const percent = i.percentKey && Number(obj[i.percentKey]) !== 0 ? Number(numberFormat((obj[i.key] / obj[i.percentKey]) * 100, true)) : null
    return { ...i, value: obj[i.key], percent }
  })
  return result
})
</script>

<style scoped lang="scss">
.totalAmt {
  display: flex;
  align-items: center;
  margin-right: 16px;

  li {
    margin-left: 8px;

    label {
      color: var(--tc-label-text);
    }

    .value {
      color: var(--tc-highlight-text);
    }
  }
}
</style>
