import { reactive } from 'vue'
import { defineStore } from 'pinia'
// import type { RouteMeta, RouteRecordNormalized, RouteLocationRaw } from 'vue-router'

// interface View {
//   fullPath: string
//   hash: string | null
//   matched: Array<RouteRecordNormalized>
//   meta: RouteMeta
//   name: string
//   params: Record<string, any>
//   path: string
//   query: Record<string, any>
//   redirectedFrom?: string
// }

export const useLayoutStore = defineStore('Layout', () => {
  const visitedViews = reactive<View[]>([])

  function addVisitedViews(view: View) {
    visitedViews.push(view)
  }

  return { visitedViews, addVisitedViews }
})
