<template>
  <div
    class="tags-container c-relative c-forbidSelect"
    ref="scrollContainer"
    @wheel.prevent="calculateLeft(true, $event)"
  >
    <div
      class="tags-wrapper c-w100p c-white-nowrap c-relative c-overflow-hidden c-h28"
      ref="scrollWrapper"
    >
      <div class="c-absolute c-flex" ref="scrollWrapper" :style="{ left: -scrollLeft + 'px' }">
        <router-link
          ref="tags"
          class="tags-item c-inline-block c-flex-ycenter c-px8 c-py0 c-mr1 c-fs12"
          :class="isActive(tag) ? 'active' : ''"
          v-for="(tag, index) in visitedViews"
          :to="tag"
          :key="`${index}_${tag.path}`"
          @contextmenu.prevent="openMenu(tag)"
          @click="() => (menuData.visible = false)"
        >
          <span class="c-mr2" :style="{ color: tagColor(tag) }">{{
            tag.meta?.title ?? '主页'
          }}</span>
          <Icon
            class="c-mb2n"
            name="close"
            size="12px"
            :color="tagColor(tag)"
            @click.prevent.stop="closeSelectedTag(tag)"
            v-show="tag.name === 'accountCenter' ? false : true"
          />
        </router-link>
      </div>
    </div>
    <ul
      class="contextmenu c-absolute"
      v-show="menuData.visible"
      :style="{ left: menuData.left + 'px', top: menuData.top + 'px', zIndex: 9999 }"
    >
      <li @click="closeSelectedTag(menuData.selectedTag)">关闭本页面</li>
      <li @click="closeOtherTag(menuData.selectedTag)">关闭其他</li>
      <li @click="closeAllTag">全部关闭</li>
      <li @click="refreshTag">刷新页面</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, nextTick, reactive } from 'vue'
import { useRoute, type RouteLocation } from 'vue-router'
import { layoutStore } from '@/stores/layout'
import { appStore } from '@/stores/app'
import router from '@/router'

type MenuData = {
  visible: boolean
  left: number
  top: number
  selectedTag: RouteLocation
}

const visitedViews = layoutStore.visitedViews
const route = useRoute()
const scrollLeft = ref<number>(0)
const scrollContainer = ref<HTMLElement | null>(null)
const tags = ref<Array<any>>([])
const menuData = reactive<MenuData>({
  visible: false,
  left: 0,
  top: 38,
  selectedTag: {} as RouteLocation
})

const calculateLeft = async (isWheel: boolean, e?: WheelEvent) => {
  await nextTick()
  const containerWidth = scrollContainer.value?.offsetWidth!
  let [totalWidth, selectedLeft, selectedWidth] = [0, 0, 0]
  tags.value.forEach((tag) => {
    const $el = tag.$el
    if ($el) {
      totalWidth += $el.offsetWidth
      if (tag.to.path === route.path) {
        selectedLeft = $el.offsetLeft
        selectedWidth = $el.offsetWidth
      }
    }
  })
  if (!isWheel) {
    scrollLeft.value =
      containerWidth > totalWidth
        ? 0
        : selectedLeft < scrollLeft.value
          ? selectedLeft
          : selectedLeft + selectedWidth > containerWidth
            ? selectedLeft + selectedWidth - containerWidth
            : 0
  } else {
    const minValue = Math.min(totalWidth - containerWidth, scrollLeft.value - e!.deltaY)
    const newScrollLeft = Math.max(0, minValue)
    scrollLeft.value = containerWidth > totalWidth ? 0 : newScrollLeft
  }
}
const isActive = (tag: RouteLocation) => (tag.path === route.path ? true : false)
const closeSelectedTag = async (tag: RouteLocation) => {
  const tags = (await layoutStore.delVisitedViews(tag)) as RouteLocation[]
  if (isActive(tag)) {
    const lastTag = tags.slice(-1)[0]
    lastTag ? router.push({ path: lastTag.path }) : router.push({ path: '/accountCenter' })
  } else calculateLeft(false)
  menuData.visible = false
}
const closeOtherTag = (tag: RouteLocation) => {
  layoutStore.delOtherViews(tag)
  router.push({ path: tag.path })
  menuData.visible = false
}
const closeAllTag = () => {
  router.push({ path: '/accountCenter' })
  layoutStore.delAllViews()
}
const refreshTag = async () => {
  layoutStore.refreshViews()
  await nextTick()
  layoutStore.refreshViews()
  menuData.visible = false
}
const openMenu = (tag: RouteLocation) => {
  menuData.selectedTag = tag
  menuData.visible = true
  let $curTag
  tags.value.forEach((item) => {
    if (item.to.path === tag.path) {
      $curTag = item.$el
      menuData.left = Math.max(10, $curTag.getBoundingClientRect().left - 180)
      if (item.to.name === 'accountCenter') menuData.visible = false
    }
  })
}
const tagColor = (tag: RouteLocation) => {
  const isLight = appStore.styleTheme === 'light'
  return isActive(tag) ? '#ffffff' : isLight ? '#666' : '#999'
}

// 挂载时，如果是 layout，则清空并跳转到主页
onMounted(() => {
  const curRoute = router.currentRoute.value
  if (curRoute.name === 'layout') {
    closeAllTag()
  } else {
    const existRouter = visitedViews.map((i) => i.name).includes(curRoute.name)
    existRouter || layoutStore.addVisitedViews({ ...curRoute })
  }
})

// 路由变换时重新渲染 tagsView 组件
watch(route, (to) => {
  const existRouter = visitedViews.map((i) => i.name).includes(to.name)
  existRouter || layoutStore.addVisitedViews({ ...to })
  calculateLeft(false)
  menuData.visible = false
})
</script>

<style scoped lang="scss">
.tags-container {
  background-color: var(--tc-tabbar);

  .tags-wrapper {
    border-bottom: 2px solid var(--tc-brand);
    box-shadow:
      0 1px 3px 0 rgba(0, 0, 0, 0.12),
      0 0 3px 0 rgba(0, 0, 0, 0.04);

    .tags-item {
      height: 28px;
      line-height: 28px;
      text-decoration: none;
      background-color: var(--tc-tabbar);
      border-radius: 4px 4px 0 0;
    }

    .tags-item.active {
      background-color: var(--tc-brand);
    }

    .tags-item.active span {
      color: white;
      font-weight: 700;
    }
  }

  .contextmenu {
    background-color: var(--tc-table-select-normal);

    li {
      padding: 7px 16px;

      &:hover {
        background-color: var(--tc-table-select-hover);
      }
    }
  }
}
</style>
