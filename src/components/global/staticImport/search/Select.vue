<template>
  <div>
    <el-select-v2 :item-height="24" :height="height" clearable filterable :options="options" v-bind="$attrs"
      v-on="$attrs.on" collapse-tags collapse-tags-tooltip />
  </div>
</template>

<script setup lang="tsx">
import { watch, useAttrs, shallowRef } from 'vue'
// 自动计算下拉列表高度
const attrs = useAttrs()
const height = shallowRef(100)
const options = shallowRef([])
const calHeightFn = (optionV2: any) => {
  options.value = optionV2 // 解决类型警告问题
  const calHeight = optionV2?.length * 20 + 20
  height.value = calHeight > 260 ? 260 : calHeight
}
// 判断是普通数组还是响应式对象
if (Array.isArray(attrs.optionV2)) {
  calHeightFn(attrs.optionV2)
} else {
  watch(attrs.optionV2, calHeightFn, { immediate: true })
}
</script>
