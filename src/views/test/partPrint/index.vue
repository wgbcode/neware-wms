<template>
  <div>
    <ul id="userInfoBox" class="infinite-list" style="overflow: auto">
      <li v-for="i in 100" :key="i" class="infinite-list-item">{{ i }}</li>
    </ul>
    <div class="c-flex-center c-mt10">
      <el-button v-print="printOption" :loading="printLoading" type="primary">局部打印</el-button>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue'
const printLoading = ref(false)
// 打印指令配置参数（去除页眉和页脚、显示背景图表需用户自行在打印页面设置）
const printOption = {
  // 打印区域
  id: 'userInfoBox',
  // 打印标题
  popTitle: '打印测试标题',
  // 打印前
  beforeOpenCallback() {
    printLoading.value = true
  },
  // 执行打印
  openCallback() {
    printLoading.value = false
  }
}
</script>

<style scoped lang="scss">
// 重要：必须设置，解决无法打印多页和页尾页脚问题
@media print {
  @page {
    size: auto;
    margin: 5mm;
  }
  body,
  html,
  div,
  ul,
  li {
    height: auto !important;
  }
}

.infinite-list {
  padding: 0;
  margin: 0;
  list-style: none;
  height: 95%;
  .infinite-list-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    background: var(--el-color-primary-light-9);
    margin: 10px;
    color: var(--el-color-primary);
  }
  .infinite-list-item + .list-item {
    margin-top: 10px;
  }
}
</style>
