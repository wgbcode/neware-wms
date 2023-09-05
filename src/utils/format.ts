import { isEmptyVal } from './common'

// 数字格式化：数字转为千分位，并保留指定小数位
export function numberFormat(
  oldNum: string | number | null | undefined,
  isInteger = false,
  min = 4,
  max = 6
) {
  let newNum = isEmptyVal(oldNum) ? '0' : oldNum
  const numArr = Number(newNum)
    .toLocaleString('en-US', { minimumFractionDigits: min, maximumFractionDigits: max })
    .split('.')
  newNum = isInteger ? numArr[0] : numArr[0] + '.' + numArr[1]
  return newNum
}
