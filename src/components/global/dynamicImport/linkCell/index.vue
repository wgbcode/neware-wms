<template>
  <div class="link-cell" :class="type === 'number' ? 'link-cell-number' : ''">
    <img class="pointer" v-if="showPointer" :src="iconLink" @click="handleClick" alt="SVG Icon" />
    <span class="link-cell-text">
      <slot name="text">
        {{ text ? text : '' }}
      </slot>
    </span>
    <div class="tag">
      <span class="link-cell-top-tag" v-if="showTag">
        <slot name="tag">
          {{ tag ? tag : '' }}
        </slot>
      </span>
      <span class="link-cell-bottom-tag">
        <slot name="bottom-tag"> </slot>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { getURL } from '@/utils/common'
// 参数
const props = defineProps({
  hasPointer: {
    type: Boolean,
    default: null // 箭头根据text有无判断，hasPointer是强制显示/隐藏
  },
  text: {
    type: [String, Number],
    default: '' // 文本内容
  },
  hasTag: {
    type: Boolean,
    default: null // 标签默认根据tag有无判断，hasTag是强制显示/隐藏
  },
  tag: {
    type: String,
    default: '' // 标签
  },
  type: {
    type: String,
    default: '' // type = number时，数字放在右边
  }
})
// icons
const iconLink = getURL('assets/icons/icon-link.svg')
// emits
const emits = defineEmits(['click'])
const slots = useSlots()
const showPointer = computed(() => {
  if (props.hasPointer === null) {
    // 为空时表示默认，则根据text判断
    let defaultText = ''
    let propsText = props.text as unknown
    if (typeof propsText === 'string') {
      defaultText = propsText.trim()
    } else if (typeof propsText === 'number' || typeof propsText === 'boolean') {
      defaultText = propsText?.toString().trim()
    }
    return slots.text || defaultText !== ''
  } else {
    return props.hasPointer
  }
})

const showTag = computed(() => {
  if (props.hasTag === null) {
    return props.tag !== '' || slots.tag // tag内容或者启用插槽
  } else {
    return props.hasTag
  }
})
function handleClick(...args: any[]) {
  emits('click', args)
}
</script>
<style lang="scss" scoped>
.link-cell {
  display: flex;
  align-items: center;
  max-height: 20px;
}
.link-cell-number {
  justify-content: space-between;
}
.pointer {
  cursor: pointer;
  margin-right: 2px;
}
.tag {
  position: relative;
  height: 20px;
  .link-cell-top-tag {
    display: inline-block;
    white-space: nowrap;
    margin-left: 0px;
    transform: scale(0.78); // 10px
    transform-origin: top left; // 左边作为源点
    position: absolute;
    top: -3px;
    left: 2px;
    color: #da0721;
  }
  .link-cell-bottom-tag {
    display: inline-block;
    white-space: nowrap;
    margin-left: 0px;
    transform: scale(0.78); // 10px
    transform-origin: bottom left; // 左边作为源点
    position: absolute;
    bottom: -3px;
    left: 2px;
    color: #da0721;
  }
}
</style>
