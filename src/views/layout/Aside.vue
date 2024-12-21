<template>
  <div>
    <el-row>
      <el-menu :default-active="defaultActive" asideRoutes :unique-opened="true" text-color="#fff" @select="handleMenuSelect">
        <AsideItem v-for="route in asideRoutes" :key="route.name" :item="route" class="c-forbidSelect" />
      </el-menu>
    </el-row>
    <div v-if="!isSystem" class="c-flex-center c-mb10">
      <img class="c-h14" src="@images/logo-word.png" alt="" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from '@/router'
import { useRoute, type RouteRecordRaw } from 'vue-router'
import AsideItem from './AsideItem.vue'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  isSystem: {
    type: Boolean,
    default: false
  }
})

// 数据初始化
const defaultActive = ref<string>()
const asideRoutes = ref<RouteRecordRaw[]>([])
const handleMenuSelect = (path: string) => router.push({ path })
onMounted(() => {
  const curRoute = router.currentRoute.value
  const path = curRoute.meta.isSys ? curRoute.path : '/roleManager'
  defaultActive.value = props.isSystem ? path : curRoute.path
  const matchName = props.isSystem ? 'systemSetting' : 'vue3home'
  const matchData = router.getRoutes().find((i) => i.name === matchName)!.children!
  asideRoutes.value = props.isSystem ? matchData.filter((i) => ['BaseConfig'].includes(i.name as string)) : matchData
})
// 监听路由变化
const route = useRoute()
watch(route, (to) => (defaultActive.value = to.path))
</script>
