<template>
  <div>
    <el-row>
      <el-menu default-active="" asideRoutes @select="handleMenuSelect">
        <AsideItem v-for="route in asideRoutes" :key="route.name" :item="route" />
      </el-menu>

    </el-row>
    <!-- <el-row>
      <el-col>
        <el-menu default-active="1" text-color="#fff" @select="handleMenuSelect">
          <el-sub-menu index="1">
            <template #title>
              <Icon name="account-center" color="#fff" size="18px" />
              <span class="c-ml5">账号中心</span>
            </template>
            <el-menu-item index="/accountCenter/accountInfo">账号资料</el-menu-item>
            <el-menu-item index="/accountCenter/modifyPassword">修改密码</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <Icon name="order-manage" color="#fff" size="18px" />
              <span class="c-ml5">订单管理</span>
            </template>
            <el-menu-item index="/orderManage/logisticsOrder">采购订单</el-menu-item>
            <el-menu-item index="/orderManage/purchaseOrder">报价单</el-menu-item>
            <el-menu-item index="/orderManage/quoteOrder">物流订单</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-col>
    </el-row> -->
    <div class="c-flex-center c-mb10"><img class="c-h14" src="@images/logo-word.png" alt="" /></div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import AsideItem from './AsideItem.vue'

const router = useRouter()
const route = useRoute()
const asideRoutes = router.options.routes.filter(i => i.name === 'layout')[0].children
console.log('asideRoutes', asideRoutes)
const handleMenuSelect = (path: string) => {
  console.log('path', path)
  router.push({ path })
}
</script>
