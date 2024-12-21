<template>
  <div class="btn-wrapper c-flex-ycenter">
    <el-button
      v-for="item of option.filterBtnsOption?.filter((i) => i.show)"
      class="btn-box"
      style="margin-right: 8px"
      @click="() => item.click(item.key)"
      :type="item.type"
      size="small"
      :key="item.key"
    >
      {{ item.name }}
      <span class="btn-num-tag" id="preNum">{{ numberFormat(item.qty, true) }}</span>
    </el-button>
    <el-tooltip effect="dark" placement="top-start" class="tooltip">
      <template #content>
        <div v-for="item in option.filterBtnsOption?.filter((i) => i.show && i.tooltip)" :key="item.key">
          <label>{{ item.name }}: </label>
          <span>{{ item.tooltip }}</span>
        </div>
      </template>
      <img src="@/assets/images/question.svg" alt="" />
    </el-tooltip>
  </div>
</template>

<script setup lang="tsx">
import { numberFormat } from '@/utils/format.js'
import { type PropType } from 'vue'
import type { CompOption } from './index.vue'
export interface FilterBtnsOption {
  name: string // 按钮名
  key: string // 唯一标识
  qty: number // 右上角小线点数值
  type: string // 当前按钮类型
  tooltip: string
  show: boolean // 是否显示
  click: Function // 点击触发函数
}
defineProps({
  option: {
    type: Object as PropType<CompOption>,
    required: true
  }
})
</script>

<style scoped lang="scss">
.btn-wrapper {
  :deep(.el-button) {
    height: 18px;
    border-radius: 2px;
    padding: 0 8px;
    font-size: 12px;
    border: none;
    margin-bottom: 0;
  }
  .btn-box {
    position: relative;
    margin-left: 0px;
    .btn-num-tag {
      position: absolute;
      right: -4px;
      top: -6px;
      display: flex;
      color: #e6e6e6;
      height: 14px;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      padding: 0 6px 1px 6px;
      background-color: #ea3553;
      border-radius: 10px;
      z-index: 10;
    }
  }
  .tooltip {
    ul > li {
      display: flex;
      align-items: center;
    }
    img {
      margin: 2px 8px 0 0;
    }
  }
}
</style>
