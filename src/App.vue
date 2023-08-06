<script setup lang="ts">
import { ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
const isDark = useDark({ valueDark: 'dark', valueLight: 'light' })
const toggleDark = useToggle(isDark)
const checked1 = ref(true)
const checked2 = ref(false)
const checked3 = ref(false)
const checked4 = ref(false)
</script>

<template>
  <div>
    <!-- element-ui Icon 测试 -->
    <div class="wrapper">
      <el-button type="primary" icon="Delete">test</el-button>
      <el-button type="primary">
        <el-icon style="vertical-align: middle"><Search /></el-icon>
        <span style="vertical-align: middle"> Search </span>
      </el-button>
      <el-icon size="50" color="#f75239"><Edit /></el-icon>
      <Search style="width: 1em; height: 1em; margin-right: 8px" />
    </div>

    <!-- 自定义 Icon 图标 -->
    <div class="wrapper">
      <SvgIcon name="delete" color="black" size="50px"></SvgIcon>
      <SvgIcon name="save" color="red" size="50px"></SvgIcon>
    </div>

    <!-- 主题样式测试 -->
    <div class="wrapper" style="flex-direction: column">
      <el-button type="primary" @click="toggleDark()">主题切换</el-button>
      <div>
        <el-checkbox v-model="checked1" label="Option 1" size="large" />
        <el-checkbox v-model="checked2" label="Option 2" size="large" />
      </div>
      <div>
        <el-checkbox v-model="checked3" label="Option 1" />
        <el-checkbox v-model="checked4" label="Option 2" />
      </div>
    </div>

    <!-- 自定义类名（样式） -->
    <div class="c_w300 c_h300 c_fw700 c_fs30" style="border: 1px solid black">Test</div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  display: flex;
  margin: 20px;
  border: 1px solid black;
  padding: 20px;
}
</style>
