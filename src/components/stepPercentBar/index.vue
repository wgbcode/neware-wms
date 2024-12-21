<template>
  <div class="c-h100p c-flex-ycenter">
    <div v-if="info.length > 0" class="c-flex-ycenter c-h100p c-w100p c-relative">
      <div class="c-flex c-h11" style="width: calc(100% - 0px); border: 1px solid #333">
        <div v-for="item in sortedInfo" :key="item.step" :style="generateStyle(item)" />
      </div>
      <span class="c-absolute c-r2" style="top: -1px; color: var(--tc-highlight-text)">{{ completedPercent }}%</span>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { computed } from 'vue'

export type StepPBInfoItem = {
  step: number // 用于排序
  name?: string
  status: boolean // 是否已完成。完成显示绿色，未完成显示红色
  percent: number // 百分比，加起来等于 100
}

const props = defineProps({
  info: {
    type: Array<StepPBInfoItem>,
    required: true
  }
})
const sortedInfo = computed(() => {
  return props.info.toSorted((a, b) => a.step - b.step)
})
const completedPercent = computed(() => {
  return Math.floor(props.info.filter((i) => i.status).reduce((a, b) => a + b.percent, 0))
})
function generateStyle(item: StepPBInfoItem) {
  const isLastStep = item.step === props.info[props.info.length - 1].step
  return {
    height: '100%',
    width: item.percent + '%',
    backgroundColor: item.status ? 'var(--tc-progress-green)' : 'var(--tc-progress-red)',
    marginRight: isLastStep ? '0px' : '2px'
  }
}
</script>

<style scoped lang="scss"></style>
