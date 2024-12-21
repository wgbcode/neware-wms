<template>
  <div>
    <!-- 将权限按钮 ID 作为参数传入 v-permission 指令，即可控制权限按钮显示和隐藏 -->
    <el-button v-permission:test1 type="primary">有权限1</el-button>
    <el-button v-permission:test2 type="primary">有权限2</el-button>
    <el-button v-permission:test3 type="primary">无权限3</el-button>
  </div>
</template>
