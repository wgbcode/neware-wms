import type { TableConfig, ColumnsConfig } from './index.vue'
import type { TableColumnCtx } from 'element-plus'

export const addTableDefaultConfig = (tableConfig: TableConfig | undefined) => {
  const config = (tableConfig ??= {})
  config.on ??= {}
  config.stripe ??= true
  config.border ??= true
  config.selectRowOnClick ??= true
  config['style'] ??= { width: config.width ?? '100%' }
  config['highlight-current-row'] ??= true
  config['table-layout'] ??= 'fixed'
  // 自定义表尾合计行属性
  if (config.isCustomFooter) {
    config['show-summary'] = true
    config['summary-method'] = getSummaries(config.footerMethod!)
  }
  return config
}

export const addColumnsDefaultConfig = (columnsConfig: ColumnsConfig) => {
  return columnsConfig.flatMap((config) => {
    // 判断是否要隐藏列
    if (config.hide) {
      return []
    } else {
      const attr = (config.slotAttr ??= {})
      const params = (config.slotParams ??= {})
      params.prefix ??= ''
      config.slotOn ??= {}
      config.headerSlotOn ??= {}
      config.headerSlotAttr ??= {}
      config.type === 'selection' ? ((config.width ??= '30px'), (config.align ??= 'center')) : ''
      config.type === 'expand' ? ((config.slotName ??= 'expand'), (config.width = '30px')) : '' // 需自定义展开插槽模板，可参考官方例子
      config['show-overflow-tooltip'] ??= true
      switch (config.slotName) {
        case 'index':
          config.width ??= '35px'
          config.label ??= '#'
          config.align ??= 'center'
          config['show-overflow-tooltip'] = false
          break
        case 'radio':
          config.width ??= '35px'
          config.label ??= ''
          config.align ??= 'center'
          break
        case 'number':
          config.align ??= 'right'
          break
        case 'price':
          config.align ??= 'right'
          params.format = { isInteger: false, min: 2, max: 2, ...params.format }
          break
        case 'date':
          params.format ??= { format: 'YYYY.MM.DD' }
          break
        case 'datetime':
          params.format ??= { format: 'YYYY.MM.DD HH:mm:ss' }
          break
        case 'input':
          attr.placeholder ??= '请输入'
          config['show-overflow-tooltip'] = false
          if (params.type === 'number') {
            config.width ??= '120px'
          } else {
            config.width ??= '150px'
          }
          break
        case 'select':
          config['show-overflow-tooltip'] = false
          // config.width ??= '150px'
          attr.placeholder ??= '请选择'
          attr.options ??= []
          attr.clearable ??= false
          attr['item-height'] ??= 24
          attr.multiple ??= false // 是否支持多选
          attr.filterable ??= false // 是否支持搜索
          // 消除 popper 警告
          attr['popper-options'] = { modifiers: [{ name: 'computeStyles', options: { adaptive: false } }] }
          break
        case 'treeSelect':
          config['show-overflow-tooltip'] = false
          config.width ??= '150px'
          attr.placeholder ??= '请选择'
          attr.data ??= []
          attr.filterable ??= true
          // 消除 popper 警告
          attr['popper-options'] = { modifiers: [{ name: 'computeStyles', options: { adaptive: false } }] }
          break
        case 'datePicker':
          config['show-overflow-tooltip'] = false
          attr.type ??= 'date' // type:year/month/date/dates/datetime/week/datetimerange/daterange/monthrange
          attr.size ??= 'default'
          // 消除 popper 警告
          attr['popper-options'] = { modifiers: [{ name: 'computeStyles', options: { adaptive: false } }] }
          if (attr.type === 'date') {
            config.width ??= '140px'
            attr.format ??= 'YYYY.MM.DD'
            attr['value-format'] ??= 'YYYY.MM.DD'
          } else if (attr.type === 'month') {
            config.width ??= '120px'
            attr.format ??= 'YYYY.MM'
            attr['value-format'] ??= 'YYYY.MM'
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
    }
  })
}

// 单元格添加箭头后，判断文本的类型并自动格式化
function arrowTextType(params: AnyObject, type: string) {
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
interface SummaryMethodProps<T = ColumnsConfig> {
  columns: TableColumnCtx<T>[]
  data: T[]
}
function getSummaries(callBack: Function) {
  return ({ columns, data }: SummaryMethodProps) => {
    const sums: string[] = []
    columns.forEach((column, index) => {
      const columnData = data.map((item: AnyObject) => item[column.property])
      sums[index] = callBack(column.property, columnData) || ''
    })
    return sums
  }
}
