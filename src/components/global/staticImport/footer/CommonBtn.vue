<template>
  <div class="btn-wrapper c-flex-ycenter">
    <el-button
      class="btn-box"
      style="margin-right: 8px"
      @click="item?.click"
      :type="item?.type ?? 'primary'"
      size="small"
      :key="item?.name"
      :loading="item?.loading"
    >
      <Icon v-show="!item?.loading" :name="item?.iconName" size="13" class="c-mr2" />
      <span>{{ item?.name }}</span>
    </el-button>
  </div>
</template>

<script setup lang="tsx">
import { type PropType, computed } from 'vue'
import type { CompOption } from './index.vue'
export interface CommonOption {
  name: string // 按钮名（唯一标识）
  type?: string // 当前按钮类型
  click: Function // 点击触发函数
  iconName: string // 图标名
  loading: boolean
}
const props = defineProps({
  option: {
    type: Object as PropType<CompOption>,
    required: true
  }
})
const item = computed<CommonOption | undefined>(() => props.option.commonOption)
</script>

<style scoped lang="scss">
:deep(.el-button) {
  height: 18px;
  border-radius: 2px;
  padding: 0 8px;
  font-size: 12px;
  border: none;
  margin-bottom: 0;
}
</style>
