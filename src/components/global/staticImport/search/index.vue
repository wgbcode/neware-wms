<template>
  <div class="c-flex-ycenter c-flex-only-wrap">
    <div v-for="(item, index) in newConfig" :key="index">
      <component
        v-if="item.isShow"
        :is="matchMap[item.name]"
        v-model="newData[item.prop ?? '']"
        v-bind="item.attr"
        :style="{ ...item.style }"
        :text="item.text"
        :on="item.on ?? {}"
        :filter="item.filter"
        :filterConfig="config"
        :filterData="newData"
        :filterName="$attrs.filterName"
      />
    </div>
    <slot></slot>
  </div>
</template>

<script lang="tsx">
import Button from './Button.vue'
import Input from './Input.vue'
import Select from './Select.vue'
import TreeSelect from './TreeSelect.vue'
import DatePicker from './DatePicker.vue'
import TextPicker from './TextPicker.vue'
import SearchFilter from './SearchFilter.vue'

export const matchMap: Record<string, Component> = {
  button: Button,
  input: Input,
  select: Select,
  treeSelect: TreeSelect,
  date: DatePicker,
  textPicker: TextPicker,
  searchFilter: SearchFilter // 筛选器
}
</script>

<script setup lang="tsx">
import { type PropType, type Component, watch } from 'vue'
import addDefaultConfig from './addDefaultConfig'
import useVModel from '@/hooks/useVModel'

export type Config = {
  name: string
  prop?: string
  text?: string
  isShow?: boolean
  attr?: AnyObject
  style?: AnyObject
  on?: AnyObject
  filter?: boolean // 设置成 true 自动开启筛选器功能，但初始化时需要传入默认值
}[]
const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  config: {
    type: Object as PropType<Config>,
    required: true
  }
})

// config 更新时，重新配置默认值
let newConfig = addDefaultConfig(props.config)
watch(
  () => props.config,
  () => (newConfig = addDefaultConfig(props.config))
)

// 子组件数据改变时，自动通知根组件修改数据，类似 defineModel
const emit = defineEmits(['update:data'])
const newData = useVModel(props, 'data', emit)
</script>

<style scoped lang="scss">
:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-select-v2__wrapper) {
  height: 20px;
  line-height: 20px;
  min-height: 20px;
  border-radius: 1px;
  box-shadow: none;
  border: 1px solid var(--tc-input-border);

  &.is-focus,
  &.is-focused,
  &.is-active {
    border: 1px solid var(--tc-global-yellow);
  }
}

:deep(.el-tag--small) {
  height: 16px;
}

:deep(.el-select__selection) {
  flex-wrap: nowrap;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper),
:deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: none !important;
  border: 1px solid var(--tc-global-yellow);
}

:deep(.el-range-editor.is-active:hover),
:deep(.el-date-editor.el-input__wrapper:hover),
:deep(.el-select__wrapper.is-hovering),
:deep(.el-select:hover:not(.el-select--disabled) .el-input__wrapper) {
  box-shadow: none;
}

:deep(.el-input__inner) {
  height: 20px;
  line-height: 18px;
  border-radius: 0;
}

:deep(.el-button) {
  border-radius: 2px;
}
</style>
