import { isEmptyVal } from './common'

type NumberFormat2 = {
  oldNum: string | number | null | undefined
  isInteger: boolean
  min: number
  max: number
}

// 数字格式化：数字转为千分位，并保留指定小数位
export function numberFormat(
  oldNum: string | number | null | undefined,
  isInteger = false,
  min = 2,
  max = 2
) {
  let newNum = isEmptyVal(oldNum) ? '0' : oldNum
  const numArr = Number(newNum)
    .toLocaleString('en-US', { minimumFractionDigits: min, maximumFractionDigits: max })
    .split('.')
  newNum = isInteger ? numArr[0] : numArr[0] + '.' + numArr[1]
  return newNum
}

// 数字格式化：数字转为千分位，并保留指定小数位(参数为对象形式)
export function numberFormat2({ oldNum, isInteger = true, min = 2, max = 2 }: NumberFormat2) {
  return numberFormat(oldNum, isInteger, min, max)
}

// 时间格式化
export function dateformat(date: string | Date | null | undefined, format = 'yyyy-MM-dd') {
  // 非空判断
  if (!date || date === '0001-01-01T00:00:00') return ''

  // 去除中文和多空格
  date = date
    .toString()
    .replace(/[\u4e00-\u9fa5]/g, '')
    .replace(/\s+/g, ' ')

  // 自动补 0
  const d = new Date(date)
  const addZero = (n: number) => (n < 10 ? '0' + n : n)
  const year = d.getFullYear()
  const month = addZero(d.getMonth() + 1)
  const day = addZero(d.getDate())
  const hours = addZero(d.getHours())
  const minutes = addZero(d.getMinutes())
  const seconds = addZero(d.getSeconds())

  // 格式化
  switch (format) {
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`
    case 'yyyy-MM-dd HH:mm:ss':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    case 'yyyy.MM.dd':
      return `${year}.${month}.${day}`
    case 'yyyy.MM.dd HH:mm:ss':
      return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`
    default:
      throw new Error(`Unsupported format "${format}"`)
  }
}
