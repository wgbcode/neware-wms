<template>
  <el-button v-on="on ?? {}" size="small">
    <Icon
      v-if="attrs && attrs.iconName && !attrs.loading"
      :name="attrs.iconName"
      :color="newAttrs.iconColor"
      :stroke="newAttrs.iconStroke"
      :height="newAttrs.height"
      :width="newAttrs.width"
      class="c-mr2 c-mb1"
    />
    <span>{{ text }}</span>
  </el-button>
</template>

<script setup lang="ts">
import { useAttrs, computed } from 'vue'
import { appStore } from '@/stores/app'

defineProps(['text', 'on'])

// 给常用的 Icon 添加默认配置
const attrs = useAttrs()
const newAttrs = computed(() => {
  const { iconName, iconColor, iconStroke, iconSize, iconWidth, iconHeihgt } = attrs
  const defaultColor = appStore.styleTheme === 'light' ? '#fff' : '#000'
  let result = {
    iconColor: iconColor || defaultColor,
    iconStroke: iconStroke || defaultColor,
    width: iconWidth || iconSize || '14px',
    height: iconHeihgt || iconSize || '13px'
  }
  switch (iconName) {
    // 查询按钮
    case 'btn-search':
      result.iconColor = iconColor || 'transparent'
      break
  }
  return result
})
</script>
