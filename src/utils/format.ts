import { isEmptyVal } from './common'

export type NumberFormat2 = {
  value: string | number | null | undefined
  min: number
  max: number
  isInteger?: boolean // 是否是整数
}

export type DateFormat2 = {
  value: string | Date | null | undefined
  format: string
}

// 数字格式化：数字转为千分位，并保留指定小数位
export function numberFormat(value: string | number | null | undefined, isInteger = false, min = 2, max = 2) {
  let newNum = isEmptyVal(value) ? '0' : value
  const option = { minimumFractionDigits: min, maximumFractionDigits: max }
  const numArr = Number(newNum).toLocaleString('en-US', option).split('.')
  newNum = isInteger ? numArr[0] : numArr[0] + '.' + numArr[1]
  return newNum
}

// 数字格式化：数字转为千分位，并保留指定小数位(参数为对象形式)
export function numberFormat2({ value, min = 2, max = 2, isInteger = false }: NumberFormat2) {
  return numberFormat(value, isInteger, min, max)
}

// 时间格式化
export function dateFormat(value: string | Date | null | undefined, format = 'YYYY.MM.DD') {
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
    case 'YYYY.MM.DD HH:mm:ss':
      return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`
    default:
      throw new Error(`Unsupported format "${format}"`)
  }
}

export function dateFormat2({ value, format = 'YYYY.MM.DD' }: DateFormat2) {
  return dateFormat(value, format)
}
/**
 * 时长计算
 */
// CS的颜色表，颜色表的key必须是递增(标识0-5:'#42BF39'，1-5:'#F8B500'，5以上:'#EA4335')
const csColorMap: Map<number, string> = new Map([
  [0, '#42BF39'],
  [1, '#F8B500'],
  [5, '#EA4335']
])
// 时间转换秒变天
const getTimeDuration = (duration: number) => {
  return Math.floor(duration / (24 * 60 * 60 * 100)) / 10 // 一位小数
}
//计算时长，默认取CS的颜色表
export function getDuration(createTime: string | null, completeDate = null, colorMap = csColorMap) {
  if (!createTime) {
    return {
      range: '',
      color: '',
      text: ''
    }
  }
  const now: Date = completeDate ? new Date(completeDate) : new Date()
  const createTimeDate: Date = new Date(createTime)
  const durationTime: number = Math.abs(now.getTime() - createTimeDate.getTime())
  const durationDay: number = getTimeDuration(durationTime)
  let range: number = 0
  // 遍历颜色表
  for (const [key] of colorMap) {
    if (durationDay < parseFloat(key.toString())) {
      break // 获得指定颜色
    }
    if (durationDay >= parseFloat(key.toString())) {
      range = key
    }
  }
  return {
    text: formatTime(durationTime),
    range,
    color: colorMap.get(range),
    timeDiff: durationTime
  }
}

// 时长格式化，一天以内显示 ：23:34 这种格式 ，超过一天显示： 999:10:10 ，999代表天数，10:10代表时分
export function formatTime(time: number): string {
  const padZero = (value: number) => (value < 10 ? `0${value}` : `${value}`)
  const day: number = Math.floor(time / (24 * 60 * 60 * 1000))
  const hour: number = Math.floor((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minute: number = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000))
  const second: number = Math.floor((time % (60 * 1000)) / 1000)
  const formattedDay: number = day
  const formattedHour: string = padZero(hour)
  const formattedMinute: string = padZero(minute)
  const formattedSecond: string = padZero(second)
  if (day > 0) {
    return `${formattedDay}.${formattedHour}:${formattedMinute}:${formattedSecond}`
  } else {
    return `${formattedHour}:${formattedMinute}:${formattedSecond}`
  }
}

// 时长格式化,length秒
export function getDurationBySecond(length: number, colorMap = csColorMap, hideEmpty = true) {
  if (!length || length < 0) {
    if (!hideEmpty) {
      return {
        range: '',
        color: colorMap.get(0),
        text: '00:00:00'
      }
    } else {
      return {
        range: '',
        color: '',
        text: ''
      }
    }
  }
  const durationDay = getTimeDuration(length * 1000)
  let range: number = 0
  // 遍历颜色表
  for (const [key] of colorMap) {
    if (durationDay < parseFloat(key.toString())) {
      break // 获得指定颜色
    }
    if (durationDay >= parseFloat(key.toString())) {
      range = key
    }
  }
  return {
    text: formatTime(length * 1000),
    range,
    color: colorMap.get(range),
    timeDiff: length
  }
}

// 时间格式化。一天以内显示 00:23:34，超过一天显示 999:10:10，999 代表天数，10:10 代表时分
export const formatSecondTime = (time: number) => {
  const padZero = (value: number) => (value < 10 ? `0${value}` : `${value}`)
  const day = Math.floor(time / (24 * 60 * 60 * 1000))
  const hour = Math.floor((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minute = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000))
  const second = Math.floor((time % (60 * 1000)) / 1000)
  const formattedDay = day
  const formattedHour = padZero(hour)
  const formattedMinute = padZero(minute)
  const formattedSecond = padZero(second)
  if (day > 0) {
    return `${formattedDay}.${formattedHour}:${formattedMinute}:${formattedSecond}`
  } else {
    return `${formattedHour}:${formattedMinute}:${formattedSecond}`
  }
}
