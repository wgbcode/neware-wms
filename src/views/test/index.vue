<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
const isDark = useDark({ valueDark: 'dark', valueLight: 'light' })
const toggleDark = useToggle(isDark)
</script>

<template>
  <div>
    <h1 class="c-fw700 c-ml20 c-mt20">1、自定义类名</h1>
    <div class="c-w100 c-h50  c-fs30 c-ml50 c-mt20">测试</div>

    <h1 class="c-fw700 c-ml20 c-mt20">2、element plus 内置 Icon 组件(不推荐)</h1>
    <div class="c-flex c-m20 c-p20 c-flex-ycenter">
      <el-button type="primary" icon="Search">Search</el-button>
      <el-button type="primary">
        <el-icon style="vertical-align: middle">
          <Search />
        </el-icon>
        <span style="vertical-align: middle"> Search </span>
      </el-button>
      <el-icon size="50" color="#f75239">
        <Search />
      </el-icon>
      <Search style="width: 50px; height: 50px; margin-right: 8px" />
    </div>

    <h1 class="c-fw700 c-ml20 c-mt20">3、自定义 Icon 图标（推荐）</h1>
    <div class="c-flex c-m20 c-p20">
      <Icon name="save" color="red" size="50px" class="c-mr10"></Icon>
      <Icon name="delete" color="black" size="50px"></Icon>
    </div>

    <h1 class="c-fw700 c-ml20 c-mt20">4、主题样式测试</h1>
    <el-button class="c-ml20 c-w500 c-mt20" type="primary" @click="toggleDark()">主题切换</el-button>
  </div>
</template>
