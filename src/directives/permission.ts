import router from '@/router'
import type { DirectiveBinding } from 'vue'
import type { RouteRecord } from 'vue-router'

interface CustomRoutes extends RouteRecord {
  meta: {
    permBtns: {
      domId: string
    }[]
  }
}

const checkPermission = (el: HTMLElement, binding: DirectiveBinding) => {
  const curPath = router.currentRoute.value.path
  const routes = router.getRoutes() as CustomRoutes[]
  const domIds = routes.find((i) => i.path === curPath)?.meta.permBtns.map((i) => i.domId)
  if (domIds && binding.arg && !domIds.includes(binding.arg)) {
    el.parentNode && el.parentNode.removeChild(el)
  }
}

// 权限按钮指令，用于控制权限按钮显示和隐藏
const permission = {
  // 在绑定元素的父组件被挂载后调用
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
  // 在包含组件的 VNode 及其子组件的 VNode 更新后调用
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  }
}

export default permission
