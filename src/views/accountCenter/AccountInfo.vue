<template>
  <el-card class="wrapper">
    <template #header>
      <div class="header">账户资料</div>
    </template>
    <ul class="body">
      <li>公司名称<span>深圳联阳科技有限公司</span></li>
      <li>软件名称<span>NEWARE WMS 供应商系统</span></li>
      <li>软件版本<span>1.0.0</span></li>
      <li>版本日期<span>2023.10.11</span></li>
    </ul>
  </el-card>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.wrapper {
  :deep(.el-card__header) {
    background-color: var(--tc-card-header);
  }
  :deep(.el-card__body) {
    background-color: var(--tc-content-dialogd);
  }
  .header {
    font-size: 18px;
    font-weight: bold;
  }
  .header::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 1.125rem;
    background-color: #f1b720;
    margin: 0 10px -2px -14px;
  }
  .body {
    padding-left: 100px;
    background-color: var(--tc-content-dialogd);
    li {
      font-size: 12px;
      padding-top: 10px;
      color: var(--tc-label-text);
      span {
        color: var(--tc-regulart-text);
        margin-left: 100px;
      }
    }
  }
}
</style>
