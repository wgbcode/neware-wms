<template>
  <div class="c-cwhite">
    <div class="tags-wrapper c-w100p c-white-nowrap c-relative c-overflow-hidden c-h28" ref="scrollContainer">
      <div class="c-absolute" ref="scrollWrapper">
        <router-link v-for="(tag, index) in visitedViews" :to="tag" :key="`${index}_${tag.path}`">
          {{ tag.meta?.title ?? '账号资料' }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, toRaw } from 'vue'
import { useRoute, type RouteLocation } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import router from '@/router';
import { deepClone } from '@/utils/common.ts'

const layoutStore = useLayoutStore()
const visitedViews = layoutStore.visitedViews

onMounted(() => {
  router.push({ path: '/accountCenter/accountInfo' })
  layoutStore.addVisitedViews({ path: '/accountCenter/accountInfo', name: "accountInfo" } as RouteLocation)
})
const route = useRoute()
watch(route, (to, from) => {
  console.log(111, visitedViews.map(i => i.name))
  console.log(222, to.name)
  let existRouter = visitedViews.map(i => i.name).includes(to.name)
  console.log('existRouter', existRouter)
  if (!existRouter) {
    layoutStore.addVisitedViews(deepClone(to))
  }

})
</script>

<style scoped>
.tags-wrapper {
  border-bottom: 2px solid var(--tc-brand);
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);
}
</style>
