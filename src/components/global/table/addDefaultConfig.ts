import type { ColumnsConfig } from './index.vue'
import type { TableColumnCtx } from 'element-plus'

interface SummaryMethodProps<T = ColumnsConfig> {
  columns: TableColumnCtx<T>[]
  data: T[]
}

export const addTableDefaultConfig = (tableConfig: Record<string, any> | undefined) => {
  const config = (tableConfig ??= {})
  config.on ??= {}
  config.stripe ??= true
  config.border ??= true
  config['style'] ??= { width: config.width ?? '100%' }
  config['highlight-current-row'] ??= true
  config.isCustomFooter ? (config['summary-method'] = getSummaries(config.footerMethod)) : ''
  return tableConfig
}

export const addColumnsDefaultConfig = (columnsConfig: ColumnsConfig) => {
  return columnsConfig.map((config) => {
    const attr = (config.slotAttr ??= {})
    const params = (config.slotParams ??= {})
    config.slotOn ??= {}
    config.headerSlotOn ??= {}
    config.headerSlotAttr ??= {}
    config.type === 'selection' ? (config.width ??= '30px') : ''
    config.type === 'expand' ? (config.slotName ??= 'expand') : '' // 需自定义展开插槽模板，可参考官方例子
    config['show-overflow-tooltip'] ??= true
    switch (config.slotName) {
      case 'index':
        config.width ??= '35px'
        config.label ??= '#'
        break
      case 'number':
        config.align ??= 'right'
        break
      case 'price':
        config.align ??= 'right'
        params.format ??= { isInteger: false, min: 2, max: 2 }
        break
      case 'date':
        params.format ??= { format: 'YYYY.MM.DD' }
        break
      case 'datetime':
        params.format ??= { format: 'YYYY.MM.DD HH:mm:ss' }
        break
      case 'input':
        attr.placeholder ??= '请输入'
        if (params.type === 'number') {
          config.width ??= '140px'
        } else {
          config.width ??= '150px'
        }
        break
      case 'select':
        config.width ??= '150px'
        attr.placeholder ??= '请选择'
        attr.options ??= [{ value: '1', label: 'test' }]
        attr.multiple ??= false // 是否支持多选
        attr.filterable ??= false // 是否支持搜索
        break
      case 'treeSelect':
        // toDo：修复选择后数据不匹配bug
        config.width ??= '150px'
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
        break
      case 'datePicker':
        config['show-overflow-tooltip'] = false
        attr.type ??= 'date' // type:year/month/date/dates/datetime/week/datetimerange/daterange/monthrange
        attr.size ??= 'default'
        if (attr.type === 'date') {
          config.width ??= '140px'
          attr.format ??= 'YYYY.MM.DD'
          attr['value-format'] ??= 'YYYY.MM.DD'
        } else {
          config.width ??= '200px'
          attr.format ??= 'YYYY.MM.DD HH:mm:ss'
          attr['value-format'] ??= 'YYYY.MM.DD HH:mm:ss'
        }
        break
      case 'addArrow':
        params.type ??= 'text'
        params.format ??= {}
        arrowTextType(params, params.type)
    }
    config.child && addColumnsDefaultConfig(config.child)
    return config
  })
}

// 单元格添加箭头后，判断文本的类型并自动格式化
function arrowTextType(params: Record<string, any>, type: string) {
  switch (type) {
    case 'price':
      params.format = { isInteger: false, min: 2, max: 2 }
      break
    case 'date':
      params.format = { format: 'YYYY.MM.DD' }
      break
    case 'datetime':
      params.format = { format: 'YYYY.MM.DD HH:mm:ss' }
      break
  }
}

// 表尾合计，可自定义累加算法，通过 callBack 传入
function getSummaries(callBack: Function) {
  return ({ columns, data }: SummaryMethodProps) => {
    const sums: string[] = []
    columns.forEach((column, index) => {
      const values = data.map((item: Record<string, any>) => Number(item[column.property]))
      sums[index] = callBack(column.property, values) || ''
    })
    return sums
  }
}
