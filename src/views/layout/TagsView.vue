<template>
  <div class="c-cwhite">
    <div
      class="tags-wrapper c-w100p c-white-nowrap c-relative c-overflow-hidden c-h28"
      ref="scrollContainer"
    >
      <div class="c-absolute" ref="scrollWrapper">
        <router-link v-for="(tag, index) in visitedViews" :to="tag" :key="`${index}_${tag.path}`">
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import { storeToRefs } from 'pinia'

const layoutStore = useLayoutStore()
const { visitedViews } = storeToRefs(layoutStore)

onMounted(() => {})
const route = useRoute()
watch(route, (to, from) => {
  // 路由发生变化时执行的逻辑
  console.log('从', from.fullPath, '导航到', to.fullPath)

  // 执行其他操作...
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
