<template>
  <div class="c-flex-yenter c-h18">
    <el-checkbox v-model="check" @change="update" :label="option.checkBoxOption?.label" size="large" class="c-ml10" />
  </div>
</template>

<script setup lang="tsx">
import { type PropType, shallowRef } from 'vue'
import type { CompOption } from './index.vue'
export interface CheckBoxOption {
  prop: string
  label: string
}
const props = defineProps({
  option: {
    type: Object as PropType<CompOption>,
    required: true
  }
})
const check = shallowRef<boolean>(false)
const emit = defineEmits<{ update: [params: FooterUpdateEvent] }>()
const update = (value: boolean) => {
  const key = props.option.checkBoxOption?.prop
  key && emit('update', { key: 'checkBox', [key]: value })
}
</script>

<style scoped lang="scss">
:deep(.el-checkbox) {
  height: 18px;
}
</style>
