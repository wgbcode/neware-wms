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
