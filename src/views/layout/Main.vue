<template>
  <div class="c-flex-column c-flex-1">
    <TagsView v-if="!appStore.isOnlyShowMain" ref="tagsView" />
    <router-view
      v-if="layoutStore.reloadRouter"
      class="router-view c-absolute c-b0 c-l0 c-r0 c-px10 c-pb5 c-pt10 c-overflow-auto"
      :style="{ top: appStore.isOnlyShowMain ? '0' : '28px' }"
      v-slot="{ Component }"
    >
      <keep-alive :include="curRoutes">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import TagsView from './TagsView.vue'
import { layoutStore } from '@/stores/layout'
import { useRoute, useRouter } from 'vue-router'
import { appStore } from '@/stores/app'

const tagsView = ref<HTMLElement | null>(null)
const route = useRoute()
const router = useRouter()
const curRoutes = ref(formatRoutes(router.getRoutes()))

watch(route, () => {
  const newRoutes = formatRoutes(router.getRoutes()) // 获取添加动态路由后的最新路由
  curRoutes.value.length !== newRoutes.length && (curRoutes.value = newRoutes)
})

function formatRoutes(routes: AnyObject[]) {
  // 路由配置中，keepAlive 设置为 true 时缓存路由组件
  // 在 src/utils/generateRoutes.ts 中，手动配置需要缓存的页面
  return routes.flatMap((i) => (i.meta.keepAlive ? i.name : [])).filter(Boolean)
}
</script>

<style scoped lang="scss">
.router-view {
  background-color: var(--tc-mostbottom);
}
</style>
