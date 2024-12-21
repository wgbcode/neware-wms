<template>
  <svg aria-hidden="true" class="svg-icon" :width="size || width" :height="size || height" @click="newClickHandler">
    <use :xlink:href="symbolId" :fill="curColor" :stroke="stroke" />
  </svg>
</template>

<script setup lang="ts">
import { appStore } from '@/stores/app'
import { computed, type PropType } from 'vue'

const props = defineProps({
  prefix: {
    type: String,
    default: 'icon'
  },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String
  },
  stroke: {
    type: String,
    default: '#F7F7F7'
  },
  width: {
    type: String,
    default: '16px'
  },
  height: {
    type: String,
    default: '16px'
  },
  size: {
    type: String,
    default: '16px'
  },
  click: {
    type: Function as PropType<(payload: MouseEvent) => void>
  },
  // 点击时是否阻止冒泡
  stop: {
    type: Boolean,
    defalut: false
  }
})

const symbolId = computed(() => `#${props.prefix}-${props.name}`)
const curColor = computed(() => {
  const defalutColor = appStore.styleTheme === 'light' ? '#fff' : '#000'
  return props.color || defalutColor
})
const stroke = computed(() => props.stroke)
const newClickHandler = (e: MouseEvent) => {
  props.stop && e.stopPropagation()
  props.click && props.click(e)
}
</script>

<style scoped lang="scss">
.svg-icon:focus {
  outline: none;
}
</style>
