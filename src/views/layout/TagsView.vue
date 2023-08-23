<template>
  <div class="tags-container c-relative c-forbidSelect" ref="scrollContainer"
    @wheel.prevent="calculateLeft(true, $event)">
    <div class="tags-wrapper c-w100p c-white-nowrap c-relative c-overflow-hidden c-h28" ref="scrollWrapper">
      <div class="c-absolute c-flex" ref="scrollWrapper" :style="{ left: -scrollLeft + 'px' }">
        <router-link ref="tags" class="tags-item c-inline-block c-flex-ycenter c-px8 c-py0 c-mr1 c-fs12"
          :class="isActive(tag) ? 'active' : ''" v-for="(tag, index) in visitedViews" :to="tag"
          :key="`${index}_${tag.path}`" @contextmenu.prevent="openMenu(tag)">
          <span class="c-mr2 c-cblack">{{ tag.meta?.title ?? '主页' }}</span>
          <Icon class="c-mt2" name="close" size="12px" :color="isActive(tag) ? '#fff' : '#000'"
            @click.prevent.stop="closeSelectedTag(tag)" v-show="tag.name === 'home' ? false : true" />
        </router-link>
      </div>
    </div>
    <ul class="contextmenu c-absolute" v-show="menuData.visible"
      :style="{ left: menuData.left + 'px', top: menuData.top + 'px' }">
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
import router from '@/router'
import { deepClone } from '@/utils/common'

type MenuData = {
  visible: boolean,
  left: number,
  top: number,
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
    const newScrollLeft = Math.max(0, Math.min(totalWidth - containerWidth, scrollLeft.value - e!.deltaY))
    scrollLeft.value = containerWidth > totalWidth ? 0 : newScrollLeft
  }
}
const isActive = (tag: RouteLocation) => (tag.path === route.path ? true : false)
const closeSelectedTag = async (tag: RouteLocation) => {
  const tags = (await layoutStore.delVisitedViews(tag)) as RouteLocation[]
  if (isActive(tag)) {
    const lastTag = tags.slice(-1)[0]
    lastTag ? router.push({ path: lastTag.path }) : router.push({ path: '/accountCenter/home' })
  } else calculateLeft(false)
  menuData.visible = false
}
const closeOtherTag = (tag: RouteLocation) => {
  layoutStore.delOtherViews(tag)
  router.push({ path: tag.path })
  menuData.visible = false
}
const closeAllTag = () => {
  layoutStore.delAllViews()
  router.push({ path: '/accountCenter/home' })
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
      if (item.to.name === 'home') menuData.visible = false
    }
  })
}

// 挂载时，清空并跳转到主页
onMounted(() => {
  closeAllTag()
})

// 路由变换时重新渲染 tagsView 组件
watch(route, (to) => {
  let existRouter = visitedViews.map((i) => i.name).includes(to.name)
  existRouter ? '' : layoutStore.addVisitedViews(deepClone(to))
  calculateLeft(false)
  menuData.visible = false
})
</script>

<style scoped lang="scss">
.tags-container {
  background-color: var(--tc-tabbar);

  .tags-wrapper {
    border-bottom: 1px solid var(--tc-brand);
    box-shadow:
      0 1px 3px 0 rgba(0, 0, 0, .12),
      0 0 3px 0 rgba(0, 0, 0, .04);

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