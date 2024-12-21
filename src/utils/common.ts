import { getCurrentInstance, type ComponentInternalInstance, type Ref } from 'vue'
import { dateFormat } from './format'

type GetRootComponent = {
  component?: ComponentInternalInstance | null
  queryName: string
}

// 添加一个监听器
export function on(element: Element | HTMLElement | Document | Window, event: string, handler: EventListenerOrEventListenerObject) {
  if (element && event && handler) {
    element.addEventListener(event, handler, false)
  }
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

// 深拷贝。推荐使用 lodash-es 的 cloneDeep
export function deepClone<T = any>(value: T): T {
  // 普通类型
  const isOrdinary = ['number', 'string', 'boolean', 'undefined', 'symbol'].includes(typeof value) || value === null
  if (isOrdinary) return value
  // @ts-ignore
  // 引用类型，即对象（普通对象、函数、数组、日期、正则）
  const cloneObj = new value.constructor() || Object
  value && Object.entries(value).forEach(([key, val]) => (cloneObj[key] = deepClone(val)))
  return cloneObj
}

// 获取图片绝对路径（动态绑定）
export function getImgURL(name: string, suffic = 'png') {
  return new URL(`/src/assets/images/${name}.${suffic}`, import.meta.url).href
}

// 获取路径的绝对路径（动态绑定）
export function getURL(url: string) {
  return new URL(`/src/${url}`, import.meta.url).href
}

// 获取当前组件实例的名称
export function getCurInstanceName() {
  const component = getCurrentInstance()
  return component?.type.__name || component?.type.name
}

// 获取当前组件实例的外层组件实例（根据 name 来匹配）
export function getComponentInstance({ component, queryName }: GetRootComponent): ComponentInternalInstance | undefined {
  component || (component = getCurrentInstance())
  const name = component?.type.__name || component?.type.name
  if (component && name === queryName) {
    return component
  }
  if (component && component.parent) {
    return getComponentInstance({ component: component.parent, queryName })
  }
}

/**
 * ### 获取当前日期/时间字符串
 * @param month 当前月份或其它月份
 * @param format 日期/时间的格式
 * @param backMonth month 为 otherMonth 时的回退月份。如 backMonth 为 2 表示上两个月
 */
export function getDateStr(month = 'curMonth', format = 'yyyy.MM.dd', backMonth = 1) {
  const now = new Date()
  let targetDate
  if (month === 'otherMonth') {
    let year = now.getFullYear()
    let month = now.getMonth() - backMonth
    if (month < 0) {
      year--
      month = 12 - (backMonth - now.getMonth())
    }
    const daysOfMonth = new Date(year, month + 1, 0).getDate() // date 参数设为零，表示创建的日期为给定月份的最后一天
    const day = Math.min(now.getDate(), daysOfMonth) // 可能的情况，now.getDate()：30  |  daysOfMonth：28
    targetDate = new Date(year, month, day, now.getHours(), now.getMinutes(), now.getSeconds())
  } else {
    targetDate = now
  }
  targetDate = targetDate.toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '.')
  switch (format) {
    case 'yyyy.MM':
      targetDate = targetDate.split('.')[0] + '.' + targetDate.split('.')[1]
      break
    case 'yyyy.MM.dd':
      targetDate = targetDate.split(' ')[0]
      break
    case 'yyyy.MM.dd HH:mm:ss':
      break
  }
  return dateFormat(targetDate)
}

// 返回异步函数，用于更改 loading 的状态
export function runWithLoadingState(asyncCallBack: Function, loadingRef: Ref<boolean>) {
  return async () => {
    try {
      loadingRef.value = true
      await asyncCallBack()
    } finally {
      loadingRef.value = false
    }
  }
}

// 使用 canvas 获取文本的宽度
export function getTextWidthByCanvas(text: string | number, textFont?: string): number {
  const canvasId = 'textWidthCanvas' // 定义 canvas 的唯一 ID
  let canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.id = canvasId
    document.body.appendChild(canvas)
  }
  const context = canvas.getContext('2d')!
  context.font =
    textFont ??
    `normal 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell,
      "Helvetica Neue", "sans-serif"`
  return context.measureText(String(text)).width
}

export const isNumber = (str: string): boolean => /^-?\d*(\.\d*)?$/.test(str)

// 首字母大写
export function capitalizeFirstLetter(string: string) {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
}
