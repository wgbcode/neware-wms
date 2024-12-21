<template>
  <div class="btn-wrapper c-h18">
    <el-dropdown class="c-mr6" @command="item?.command" :placement="item?.placement ?? 'top'">
      <el-button :type="item?.type ?? 'primary'">
        <span> {{ item?.name }}</span>
        <Icon name="btn-dropdown" color="black" />
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="option in item?.options" :key="option.value" :command="option.value">{{ option.label }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="tsx">
import { type PropType, computed } from 'vue'
import type { CompOption } from './index.vue'
export interface DropdownBtnOption {
  name: string
  type?: string
  placement?: string
  command: (value: string) => void
  options: SelectList[]
}
const props = defineProps({
  option: {
    type: Object as PropType<CompOption>,
    required: true
  }
})
const item = computed<DropdownBtnOption | undefined>(() => props.option.dropdownBtnOption)
</script>

<style scoped lang="scss">
:deep(.el-dropdown) {
  height: 18px;
  button {
    height: 18px;
    margin-bottom: 4px;
    outline: none;
    &:hover {
      outline: none;
    }
  }
}
</style>
