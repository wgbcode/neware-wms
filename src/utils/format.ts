import { isEmptyVal } from './common'

export type NumberFormat2 = {
  value: string | number | null | undefined
  isInteger: boolean
  min: number
  max: number
}

export type DateFormat2 = {
  value: string | Date | null | undefined
  format: string
}

// 数字格式化：数字转为千分位，并保留指定小数位
export function numberFormat(
  value: string | number | null | undefined,
  isInteger = false,
  min = 2,
  max = 2
) {
  let newNum = isEmptyVal(value) ? '0' : value
  const numArr = Number(newNum)
    .toLocaleString('en-US', { minimumFractionDigits: min, maximumFractionDigits: max })
    .split('.')
  newNum = isInteger ? numArr[0] : numArr[0] + '.' + numArr[1]
  return newNum
}

// 数字格式化：数字转为千分位，并保留指定小数位(参数为对象形式)
export function numberFormat2({ value, isInteger = true, min = 2, max = 2 }: NumberFormat2) {
  return numberFormat(value, isInteger, min, max)
}

// 时间格式化
export function dateFormat(value: string | Date | null | undefined, format = 'YYYY-MM-DD') {
  // 非空判断
  if (!value || value === '0001-01-01T00:00:00') return ''

  // 去除中文和多空格
  value = value
    .toString()
    .replace(/[\u4e00-\u9fa5]/g, '')
    .replace(/\s+/g, ' ')

  // 自动补 0
  const d = new Date(value)
  const addZero = (n: number) => (n < 10 ? '0' + n : n)
  const year = d.getFullYear()
  const month = addZero(d.getMonth() + 1)
  const day = addZero(d.getDate())
  const hours = addZero(d.getHours())
  const minutes = addZero(d.getMinutes())
  const seconds = addZero(d.getSeconds())

  // 格式化
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'YYYY-MM-DD HH:mm:ss':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    case 'YYYY.MM.DD':
      return `${year}.${month}.${day}`
    case 'YYYY.MM.dd HH:mm:ss':
      return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`
    default:
      throw new Error(`Unsupported format "${format}"`)
  }
}

export function dateFormat2({ value, format = 'YYYY-MM-DD' }: DateFormat2) {
  return dateFormat(value, format)
}
