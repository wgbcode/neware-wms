<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="greetings">
    <!-- element-ui Icon 测试 -->
    <el-button type="primary" icon="Delete">test</el-button>
    <el-icon size="50" color="#f75239"><Edit /></el-icon>
    <el-button type="primary">
      <el-icon style="vertical-align: middle"><Search /></el-icon>
      <span style="vertical-align: middle"> Search </span>
    </el-button>
    <Search style="width: 1em; height: 1em; margin-right: 8px" />

    <!-- 自定义 Icon 图标 -->
    <SvgIcon name="delete" color="#fff" size="50px"></SvgIcon>
    <SvgIcon name="save" color="blue" size="50px"></SvgIcon>

    <h1 class="green">{{ msg }}</h1>
    <h3>
      You’ve successfully created a project with
      <a href="https://vitejs.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>. What's next?
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
