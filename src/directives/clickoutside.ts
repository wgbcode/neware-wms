import type { DirectiveBinding } from 'vue'

/**
 * 用于侦听元素的外部点击事件
 * 1、当点击被侦听元素和被侦听元素的内部元素时，事件不触发
 * 2、当点击被侦听元素的外部元素时，事件触发
 */
let hasGlobalListerner = false
const nodeHandlerList = new Map()
const clickoutside = {
  created() {
    // 初始化全局监听器
    if (!hasGlobalListerner) {
      addGlobalListerner()
      hasGlobalListerner = true
    }
  },
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    nodeHandlerList.set(el, createDocumentHandler(el, binding))
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    nodeHandlerList.set(el, createDocumentHandler(el, binding))
  },
  unmounted(el: HTMLElement) {
    nodeHandlerList.delete(el)
  }
}
function createDocumentHandler(el: HTMLElement, binding: DirectiveBinding) {
  return (clickEvent: Event) => {
    const clickTarget = clickEvent.target as Node
    const isBindExit = binding && binding.instance
    const isSelf = el === clickTarget // 判断是否是被侦听元素
    const isContainedByEl = el.contains(clickTarget) // 判断是否是被侦听元素的内部元素
    if (!isBindExit || !clickTarget || isSelf || isContainedByEl) {
      return
    } else {
      binding.value()
    }
  }
}

// 添加全局监听器
function addGlobalListerner() {
  document.addEventListener('click', (e: Event) => {
    for (const documentHandler of nodeHandlerList.values()) {
      documentHandler(e)
    }
  })
}

export default clickoutside
