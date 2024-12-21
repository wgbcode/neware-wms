<template>
  <div class="c-h100p c-flex-ycenter">
    <div class="wrapper-progress">
      <span v-if="info.isHidden"></span>
      <div v-else class="outer" ref="outer" :style="style.outer">
        <div class="bar" :style="style.inter" />
        <span class="num" :style="style.num">{{ info.num }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref, nextTick, watch, type StyleValue, type PropType, useTemplateRef } from 'vue'

export type PercentBarInfo = {
  isHidden: boolean
  num?: number
  outerColor?: string
  interColor?: string
}
interface PercentBarStyle {
  outer: StyleValue
  inter: StyleValue
  num: StyleValue
}
const props = defineProps({
  info: {
    type: Object as PropType<PercentBarInfo>,
    required: true
  }
})
const outer = useTemplateRef<HTMLElement | null>('outer')
const style = ref<PercentBarStyle>({ outer: {}, inter: {}, num: {} })
watch(
  () => props.info,
  async () => {
    const { outerColor, interColor, isHidden, num } = props.info
    if (!isHidden && num) {
      await nextTick()
      const interObj: StyleValue = {}
      const numObj: StyleValue = {}
      const width = outer.value!.offsetWidth - 2 // 减2是减去左右边框的值
      const calWidth = (num / 100) * width > width ? width : (num / 100) * width
      interObj.backgroundColor = interColor ?? ''
      interObj.width = num >= 0 ? calWidth + 'px' : 0
      if (num <= 0) numObj.left = '4px'
      else if (width - calWidth >= 25)
        numObj.left = calWidth + 2 + 'px' // 25px刚好可以放下文字
      else numObj.right = '4px'
      style.value.inter = interObj
      style.value.num = numObj
      style.value.outer = { backgroundColor: outerColor ?? '' }
    }
  },
  { immediate: true }
)
</script>

<style lang="scss">
.wrapper-progress {
  height: 14px;
  padding: 2px 0 !important;
  width: 100%;
  .outer {
    height: 100%;
    position: relative;
    width: 100%;
    border: 1px solid #333;
    .bar {
      height: 100%;
    }
    .num {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: white;
    }
  }
}
</style>
