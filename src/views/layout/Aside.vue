<template>
  <div class="">
    <el-row>
      <el-col>
        <el-menu default-active="1" text-color="#fff" @select="handleMenuSelect">
          <el-sub-menu index="1">
            <template #title>
              <Icon name="account-center" color="#fff" size="18px" />
              <span class="c-ml5">账号中心</span>
            </template>
            <el-menu-item index="1-1">账号资料</el-menu-item>
            <el-menu-item index="1-2">修改密码</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <Icon name="order-manage" color="#fff" size="18px" />
              <span class="c-ml5">订单管理</span>
            </template>
            <el-menu-item index="2-1">采购订单</el-menu-item>
            <el-menu-item index="2-2">报价单</el-menu-item>
            <el-menu-item index="2-3">物流订单</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-col>
    </el-row>
    <div class="c-flex-center c-mb10"><img class="c-h14" src="@images/logo-word.png" alt="" /></div>
  </div>
</template>

<script lang="ts" setup>
const handleMenuSelect = (index: string) => {
  console.log(index)
}
</script>
