<template>
  <el-card class="wrapper">
    <template #header>
      <div class="header">修改密码</div>
    </template>
    <ul class="body">
      <li>
        <span class="label">原始密码<i>*</i></span>
        <el-input placeholder="请输入4-6位原始密码" prefix-icon="el-icon-search" />
      </li>
      <li>
        <span class="label">新密码<i>*</i></span>
        <el-input placeholder="请输入4-6位新密码" prefix-icon="el-icon-search" />
      </li>
      <li>
        <span class="label">新密码确认<i>*</i></span>
        <el-input placeholder="请确认新密码输入一致" prefix-icon="el-icon-search" />
      </li>
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
        i {
          color: red;
        }
      }
      .label {
        display: inline-block;
        width: 100px;
      }
      :deep(.el-input) {
        width: 320px;
        margin-left: 50px;
      }
    }
  }
}
</style>
