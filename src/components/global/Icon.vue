<template>
  <svg aria-hidden="true" class="svg-icon" :width="size || width" :height="size || height">
    <use :xlink:href="symbolId" :fill="curColor" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
    type: String,
    default: '#333'
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
    type: String
  }
})

const symbolId = computed(() => `#${props.prefix}-${props.name}`)
const curColor = computed(() => props.color)
</script>

<style scoped lang="scss">
.svg-icon:focus {
  outline: none;
}
</style>
