import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RouteLocation } from 'vue-router'

export const layoutStore = defineStore('Layout', () => {
  const isShowAside = ref<boolean>(true)
  const reloadRouter = ref<boolean>(true)
  const mainTopHeight = ref<number>(0)
  const visitedViews = reactive<any[]>([])

  const toogleAside = () => (isShowAside.value = !isShowAside.value)
  const addVisitedViews = (view: RouteLocation) => visitedViews.push(view)
  const delVisitedViews = (view: RouteLocation) => {
    return new Promise((resolve) => {
      visitedViews.forEach((item, index) => (item.path === view.path ? visitedViews.splice(index, 1) : ''))
      resolve([...visitedViews])
    })
  }
  const delOtherViews = (view: RouteLocation) => {
    addVisitedViews(view)
    visitedViews.splice(1, visitedViews.length - 2)
  }
  const delAllViews = () => visitedViews.splice(1, visitedViews.length - 1)
  const refreshViews = () => (reloadRouter.value = !reloadRouter.value)
  const setMainTopHeight = (curHeight: number) => (mainTopHeight.value = curHeight)

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
})()
