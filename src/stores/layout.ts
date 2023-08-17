import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RouteLocation } from 'vue-router'

export const useLayoutStore = defineStore('Layout', () => {
  const isShowAside = ref<boolean>(true)
  const reloadRouter = ref<boolean>(true)
  const mainTopHeight = ref<number>(0)
  const visitedViews = reactive<RouteLocation[]>([])

  // Aside action
  function toogleAside() {
    isShowAside.value = !isShowAside.value
  }

  // tagsView action
  function addVisitedViews(view: RouteLocation) {
    visitedViews.push(view)
  }

  function delVisitedViews(view: RouteLocation) {
    return new Promise((resolve) => {
      visitedViews.forEach((item, index) =>
        item.path === view.path ? visitedViews.splice(index, 1) : ''
      )
      resolve([...visitedViews])
    })
  }

  function delOtherViews(view: RouteLocation) {
    addVisitedViews(view)
    visitedViews.splice(1, visitedViews.length - 2)
  }

  function delAllViews() {
    visitedViews.splice(1, visitedViews.length - 1)
  }

  function refreshViews() {
    reloadRouter.value = !reloadRouter.value
  }

  // MainTop
  function setMainTopHeight(curHeight: number) {
    mainTopHeight.value = curHeight
  }

  return {
    isShowAside,
    reloadRouter,
    visitedViews,
    mainTopHeight,
    toogleAside,
    addVisitedViews,
    delVisitedViews,
    delOtherViews,
    delAllViews,
    refreshViews,
    setMainTopHeight
  }
})
