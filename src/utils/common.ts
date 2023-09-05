import { getCurrentInstance, type ComponentInternalInstance } from 'vue'

type GetRootComponent = {
  component?: ComponentInternalInstance | null
  queryName: string
}

// 判断一个值是否为空(null、'null'、undefined、'undefined'、数字0、空字符串、空数组、空对象)
export function isEmptyVal(value: any) {
  let isEmptyVal = false
  if (
    value === null ||
    value === 'null' ||
    value === 'undefined' ||
    typeof value === 'undefined' ||
    (typeof value === 'number' && !value) ||
    (typeof value !== 'number' && (value.length === 0 || Object.keys(value).length === 0))
  ) {
    isEmptyVal = true
  }
  return isEmptyVal
}

// 深拷贝
export function deepClone(value: any) {
  // 普通类型
  const isOrdinary =
    ['number', 'string', 'boolean', 'undefined', 'symbol'].includes(typeof value) || value === null
  if (isOrdinary) return value

  // 引用类型，即对象（普通对象、函数、数组、日期、正则）
  const cloneObj = new value.constructor() || Object
  Object.entries(value).forEach(([key, val]) => (cloneObj[key] = deepClone(val)))
  return cloneObj
}

// 获取图片绝对路径（动态绑定）
export function getImgURL(name: string, suffic = 'png') {
  return new URL(`/src/assets/images/${name}.${suffic}`, import.meta.url).href
}

// 获取当前组件实例的名称
export function getCurInstanceName() {
  const component = getCurrentInstance()
  return component?.type.__name || component?.type.name
}

// 获取当前组件实例的外层组件实例（根据 name 来匹配）
export function getComponentInstance({
  component,
  queryName
}: GetRootComponent): ComponentInternalInstance | undefined {
  component ? '' : (component = getCurrentInstance())
  const name = component?.type.__name || component?.type.name
  if (component && name === queryName) return component
  if (component && component.parent)
    return getComponentInstance({ component: component.parent, queryName })
}
