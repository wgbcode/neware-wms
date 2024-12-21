<template>
  <div :class="{ wrapper: true, 'filter-wrapper': filter }">
    <span v-show="!filter" class="title">{{ title ?? '请添加title属性' }}:&nbsp; </span>
    <div :class="{ content: true, 'focus-border': isFocus }">
      <el-input
        v-bind="defalutType"
        placeholder="请输入"
        v-model="modelValue[0]"
        size="small"
        title=""
        @focus="isFocus = true"
        @blur="isFocus = false"
      >
        <template #suffix>
          <span class="c-ml2 c-mb2">{{ suffix }}</span>
        </template>
      </el-input>
      <span>-</span>
      <el-input
        v-bind="defalutType"
        placeholder="请输入"
        v-model="modelValue[1]"
        size="small"
        title=""
        @focus="isFocus = true"
        @blur="isFocus = false"
      >
        <template #suffix>
          <span class="c-ml2 c-mb2">{{ suffix }}</span>
        </template>
      </el-input>
    </div>
  </div>
</template>

<!-- 组件初始化时需要传入一个空数组 -->
<script setup lang="tsx">
import { shallowRef, useAttrs, computed } from 'vue'
const defalutType = { type: 'number', step: '0.000001' } // 默认为数字输入框
const isFocus = shallowRef(false)
const attrs = useAttrs()
const modelValue = computed(() => attrs.modelValue as string[])
const { title, suffix, filter } = attrs
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  align-items: center;
}

.title {
  color: var(--tc-primary-text);
}

.content {
  display: flex;
  align-items: center;
  border: 1px solid var(--tc-input-border);
  background-color: var(--tc-input-background);
  border-radius: 2px;
  margin-right: 4px;
  padding: 0 4px;

  span {
    padding: 0 5px;
  }

  :deep(input) {
    width: 45px;
    height: 20px;
    line-height: 20px;
    border: none;
    text-align: center;
  }
  :deep(.el-input__wrapper) {
    border: none;
    &.is-focus {
      border: none;
    }
  }
}

.wrapper:not(.filter-wrapper) {
  .focus-border {
    border: 1px solid #f1b720 !important;
  }
  :deep(.el-input__suffix) {
    right: -10px;
    top: 2px;
  }
}

.filter-wrapper .content {
  border: none;
  margin-right: 0;
  :deep(input) {
    text-align: center;
    width: 100%;
  }
}
</style>
