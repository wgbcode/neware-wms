import { computed } from 'vue'
import { deepClone } from '@/utils/common'

interface Props {
  [key: string]: any
}

// 用于实现父子间数据的双向绑定，3.4 版本后也可直接使用 defineModel
const modelWeakMap = new WeakMap()
const useVModel = <T extends Props, K extends keyof T>(props: T, propName: string, emit: Function, deep = true) => {
  let initRef: T[K]
  const handler: ProxyHandler<T[K]> = {
    get(target, key, receiver) {
      const ref = Reflect.get(target, key, receiver)
      const isObj = typeof ref === 'object' && ref !== null
      return isObj && deep ? new Proxy(ref, handler) : ref // 递归，是否开启由 deep 控制
    },
    set(target, key, value, receiver) {
      if (Reflect.get(target, key) !== value) {
        Reflect.set(target, key, value, receiver)
        emit(`update:${propName}`, deepClone(initRef))
      }
      return true
    }
  }
  const data = computed({
    get() {
      initRef = props[propName]
      // 判断是否有缓存，防止生成多个重复的响应式数据
      if (modelWeakMap.has(initRef)) {
        return modelWeakMap.get(initRef)
      } else {
        const isObj = typeof initRef === 'object' && initRef !== null
        // 如果是对象，需要监听内部数据，因为数据发生变化时，地址不会发生变化，set方法也不会触发
        const result = isObj ? new Proxy(initRef, handler) : initRef
        modelWeakMap.set(initRef, result)
        return result
      }
    },
    set(val) {
      emit(`update:${propName}`, val)
    }
  })
  return data
}

export default useVModel
