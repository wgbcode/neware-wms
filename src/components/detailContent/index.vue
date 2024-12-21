<template>
  <div class="c-flex-column">
    <div v-for="item in options" :key="item.index" class="c-mb10 c-br4 c-px10 c-pt5 c-pb10" style="background-color: var(--tc-content-background)">
      <div class="c-flex-ycenter c-mb5">
        <Icon
          class="c-no-select c-cursor-p"
          :name="getItem(item.index).iconName"
          color="var(--tc-global-yellow)"
          size="22"
          :click="() => toggleStatus(item.index)"
        />
        <span class="c-no-select c-fs14 c-fw700" style="color: var(--tc-label-text)">{{ item.index }}.&nbsp;</span>
        <span class="c-no-select c-fs14 c-fw700" style="color: var(--tc-primary-text)">{{ item.title }}</span>
        <slot v-if="item.titleSlot" :name="item.titleSlot" />
      </div>
      <transition name="fade">
        <div v-show="getItem(item.index).show">
          <slot v-if="item.contentSlot" :name="item.contentSlot" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { shallowRef } from 'vue'
interface Option {
  index: number // 序号，也是唯一标识
  defaultShow: boolean // 默认隐藏或显示
  title: string // 标题
  titleSlot?: string // 标题后插槽
  contentSlot: string // 内容插槽
}
const props = defineProps({
  options: {
    type: Array<Option>,
    required: true
  }
})
interface StatusOption {
  index: number
  show: boolean
  iconName: string
}
const statusOptions = shallowRef<StatusOption[]>([])
const getIconName = (isShow: boolean) => (isShow ? 'btn-detail-show' : 'btn-detail-hidden')
// 设置默认值
statusOptions.value = props.options.map((i) => {
  return { index: i.index, show: i.defaultShow, iconName: getIconName(i.defaultShow) }
})
// 切换显示或隐藏状态
const toggleStatus = (index: number) => {
  statusOptions.value = statusOptions.value.flatMap((i) => {
    if (i.index === index) {
      return { index: i.index, show: !i.show, iconName: getIconName(!i.show) }
    } else {
      return i
    }
  })
}
const getItem = (index: number) => statusOptions.value.find((i) => i.index === index) ?? { iconName: '', show: false }
</script>

<style scoped lang="scss">
.fade-enter-active {
  transition: all 0.25s ease;
}
.fade-leave-active {
  transition: all 0.25s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-enter,
.fade-leave-to {
  transform: translateX(5px);
  opacity: 0;
}
</style>
