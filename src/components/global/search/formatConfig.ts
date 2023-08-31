import type { Config } from './index.vue'

const shortcuts = (type: string) => {
  let texts: Array<string> = []
  let values: Array<Date | Date[]> = []
  const caculateTime = (day: number, isArray: boolean) => {
    if (isArray) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * day)
      return [start, end]
    } else {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * day)
      return date
    }
  }
  const caculteMonth = () => {
    const value1 = [new Date(), new Date()]
    const value2 = (() => {
      const end = new Date()
      const start = new Date(new Date().getFullYear(), 0)
      return [start, end]
    })()
    const value3 = (() => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 6)
      return [start, end]
    })()
    return [value1, value2, value3]
  }
  switch (type) {
    case 'date':
    case 'datetime':
      texts = ['今天', '昨天', '最近一周']
      values = [new Date(), caculateTime(1, false), caculateTime(7, false)]
      break
    case 'daterange':
    case 'datetimerange':
      texts = ['最近一周', '最近一个月', '最近三个月']
      values = [caculateTime(7, true), caculateTime(30, true), caculateTime(90, true)]
      break
    case 'monthrange':
      texts = ['本月', '今年至今', '最近六个月']
      values = caculteMonth()
      break
  }
  return [
    { text: texts[0], value: values[0] },
    { text: texts[1], value: values[1] },
    { text: texts[2], value: values[2] }
  ]
}

const dateTypeCheck = (style: Record<string, any>, attr: Record<string, any>, type: string) => {
  const resetOption = (isRange: boolean, type: string) => {
    let holder
    attr.teleported ??= false
    switch (type) {
      case 'datetime':
      case 'datetimerange':
        holder = '时间'
        attr.format ??= 'YYYY.MM.DD HH:mm:ss'
        attr['value-format'] ??= 'YYYY.MM.DD HH:mm:ss'
        break
      case 'date':
      case 'daterange':
        holder = '日期'
        attr.format ??= 'YYYY.MM.DD'
        attr['value-format'] ??= 'YYYY.MM.DD'
        break
      case 'monthrange':
        holder = '月份'
        attr.format ??= 'YYYY.MM'
        attr['value-format'] ??= 'YYYY.MM'
        break
    }
    if (isRange) {
      attr['unlink-panels'] ??= false
      attr['range-separator'] ??= '-'
      attr['start-placeholder'] ??= `开始${holder}`
      attr['end-placeholder'] ??= `结束${holder}`
      attr.shortcuts &&= shortcuts(type) // 使用默认配置或者自定义
    } else {
      attr.placeholder ??= `请选择${holder}`
      attr.shortcuts &&= shortcuts(type)
    }
  }
  switch (type) {
    case 'date':
      style.width ??= '135px'
      resetOption(false, type)
      break
    case 'daterange':
      style.width ??= '240px'
      resetOption(true, type)
      break
    case 'datetime':
      style.width ??= '200px'
      resetOption(false, type)
      break
    case 'datetimerange':
      style.width ??= '380px'
      resetOption(true, type)
      break
    case 'monthrange':
      style.width ??= '200px'
      resetOption(true, type)
      break
  }
}

export default function formatConfig(config: Config) {
  return config.map((item) => {
    item.isShow ??= true
    const attr = (item.attr ??= {})
    const style = (item.style ??= { height: '24px', marginRight: '5px', marginBottom: '10px' })
    switch (item.name) {
      case 'button':
        attr.type ??= 'default'
        style.marginLeft ??= '5px'
        break
      case 'input':
        attr.placeholder ??= '请输入'
        style.width ??= '140px'
        break
      case 'select':
        attr.placeholder ??= '请选择'
        attr.options ??= [{ value: '1', label: 'test' }]
        attr.multiple ??= false // 是否支持多选
        attr.filterable ??= true // 是否支持搜索
        style.width ??= '140px'
        break
      case 'treeSelect':
        attr.placeholder ??= '请选择'
        attr.data ??= [
          {
            value: '1',
            label: 'test 1',
            children: [
              { value: '1-1', label: 'test 1-1' },
              { value: '1-2', label: 'test 1-2' }
            ]
          }
        ]
        attr.filterable ??= true
        style.width ??= '140px'
        break
      case 'date':
        attr.type ??= 'date' // type:year/month/date/dates/datetime/week/datetimerange/daterange/monthrange
        attr.size ??= 'default'
        dateTypeCheck(style, attr, attr.type)
        break
    }
    return item
  })
}
