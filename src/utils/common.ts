// 深拷贝
export function deepClone(value: any) {
  // 普通数据类型
  if (
    ['number', 'string', 'boolean', 'undefined', 'symbol'].includes(typeof value) ||
    value === null
  )
    return value

  // 引用类型，即对象（普通对象、函数、数组、日期、正则）
  const cloneObj = new value.constructor() || Object
  Object.entries(value).forEach(([key, val]) => (cloneObj[key] = deepClone(val)))
  return cloneObj
}

// 获取图片绝对路径（动态绑定）
export function getImgURL(name: string, suffic = 'png') {
  return new URL(`/src/assets/images/${name}.${suffic}`, import.meta.url).href
}
