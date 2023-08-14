import { reactive, toRaw } from 'vue'
import { defineStore } from 'pinia'
import type { RouteLocation } from 'vue-router'

export const useLayoutStore = defineStore('Layout', () => {
  const visitedViews = reactive<RouteLocation[]>([])

  function addVisitedViews(view: RouteLocation) {
    console.log('view', view)

    visitedViews.push(view)
    console.log('visitedViews', toRaw(visitedViews))


  }

  return { visitedViews, addVisitedViews }
})
