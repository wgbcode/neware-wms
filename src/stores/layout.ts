import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { RouteLocation } from 'vue-router'

export const useLayoutStore = defineStore('Layout', () => {
  const visitedViews = reactive<RouteLocation[]>([])

  function addVisitedViews(view: RouteLocation) {
    visitedViews.push(view)
  }

  function delVisitedViews(view: RouteLocation) {
    return new Promise(resolve => {
      visitedViews.forEach((item, index) => item.path === view.path ? visitedViews.splice(index, 1) : '')
      resolve([...visitedViews])
    })
  }

  return { visitedViews, addVisitedViews, delVisitedViews }
})
