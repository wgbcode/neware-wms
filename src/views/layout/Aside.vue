<template>
  <div>
    <el-row>
      <el-menu default-active="/accountCenter/accountInfo" asideRoutes text-color="#fff" @select="handleMenuSelect">
        <AsideItem v-for="route in asideRoutes" :key="route.name" :item="route" />
      </el-menu>
    </el-row>
    <div class="c-flex-center c-mb10"><img class="c-h14" src="@images/logo-word.png" alt="" /></div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import AsideItem from './AsideItem.vue'

const router = useRouter()
const route = useRoute()
// console.log('route', route)
// console.log('router', router)
const asideRoutes = router.options.routes.filter((i) => i.name === 'layout')[0].children
const handleMenuSelect = (path: string) => {
  router.push({ path })
}
</script>
