<template>
  <div class="tags-container">
    <div
      class="tags-wrapper c-w100p c-white-nowrap c-relative c-overflow-hidden c-h28"
      ref="scrollContainer"
    >
      <div class="c-absolute c-flex" ref="scrollWrapper">
        <router-link
          ref="tag"
          class="tags-item c-flex-ycenter c-px8 c-py0 c-mr1 c-fs12"
          :class="isActive(tag) ? 'active' : ''"
          v-for="(tag, index) in visitedViews"
          :to="tag"
          :key="`${index}_${tag.path}`"
        >
          <span class="c-mr2 c-cblack">{{ tag.meta?.title ?? '主页' }}</span>
          <Icon
            class="ch12 c-w12 c-mt2"
            name="close"
            :color="isActive(tag) ? '#fff' : '#000'"
            @click.prevent.stop="closeSelectedTag(tag)"
            v-show="tag.name === 'home' ? false : true"
          />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, toRaw, toRefs, nextTick } from 'vue'
import { useRoute, type RouteLocation } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import router from '@/router'
import { deepClone } from '@/utils/common'

const layoutStore = useLayoutStore()
const visitedViews = layoutStore.visitedViews

// 挂载时跳转到主页
onMounted(() => {
  let existRouter = visitedViews.map((i) => i.name).includes('home')
  if (!existRouter) {
    router.push({ path: '/accountCenter/home' })
    layoutStore.addVisitedViews({ path: '/accountCenter/home', name: 'home' } as RouteLocation)
  }
})

// 路由变换时重新渲染 tagsView 组件
const route = useRoute()
const scrollContainer = ref(null)
const tag = ref([])
const calculateLeft = async (isWheel: boolean) => {
  console.log(111, isWheel, scrollContainer, toRefs(tag))
  console.log(222, isWheel, scrollContainer.value, toRaw(tag.value))

  await nextTick()

  tag.value.forEach((item) => {})

  // if (isWheel) {
  // } else {
  // }
}
watch(route, (to) => {
  let existRouter = visitedViews.map((i) => i.name).includes(to.name)
  existRouter ? '' : layoutStore.addVisitedViews(deepClone(to)), calculateLeft(false)
})

const isActive = (tag: RouteLocation) => (tag.path === route.path ? true : false)
const closeSelectedTag = async (tag: RouteLocation) => {
  const tags = (await layoutStore.delVisitedViews(tag)) as RouteLocation[]
  if (isActive(tag)) {
    const lastTag = tags.slice(-1)[0]
    lastTag ? router.push({ path: lastTag.path }) : router.push({ path: '/' })
  }
}
</script>

<style scoped>
.tags-container {
  background-color: var(--tc-tabbar);

  .tags-wrapper {
    border-bottom: 1px solid var(--tc-brand);
    box-shadow:
      0 1px 3px 0 rgba(0, 0, 0, 0, 0.12),
      0 0 3px 0 rgba(0, 0, 0, 0.04);

    .tags-item {
      height: 28px;
      line-height: 28px;
      text-decoration: none;
      background-color: var(--tc-tabbar);
    }

    .tags-item.active {
      background-color: var(--tc-brand);
    }

    .tags-item.active span {
      color: white;
      font-weight: 700;
    }
  }
}
</style>
