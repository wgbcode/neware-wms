import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RouteLocation } from 'vue-router'

export const useLayoutStore = defineStore('Layout', () => {
  const reloadRouter = ref<boolean>(true)
  const visitedViews = reactive<RouteLocation[]>([])

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

  function delOtherViews(view:RouteLocation){
    addVisitedViews(view)
    visitedViews.splice(1,visitedViews.length-2)
  }

  function delAllViews(){
    visitedViews.splice(1,visitedViews.length-1)
  }

  function refreshViews(){
    reloadRouter.value = !reloadRouter.value
  }

  return { visitedViews, reloadRouter, addVisitedViews, delVisitedViews, delOtherViews, delAllViews, refreshViews  }
})
