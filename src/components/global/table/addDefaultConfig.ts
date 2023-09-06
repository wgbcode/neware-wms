import type { ColumnsConfig } from './index.vue'

export const addTableDefaultConfig = (tableConfig: Record<string, any> | undefined) => {
  const config = (tableConfig ??= {})
  config.stripe ??= true
  config.border ??= true
  config['style'] ??= { width: config.width ?? '100%' }
  config['highlight-current-row'] ??= true
  return tableConfig
}

export const addColumnsDefaultConfig = (columnsConfig: ColumnsConfig) => {
  return columnsConfig.map((config) => {
    const attr = (config.attr ??= {})
    config.on ??= {}
    config['show-overflow-tooltip'] ??= true
    config.type === 'selection' ? (config.width ??= '30px') : ''
    switch (config.slotName) {
      case 'index':
        config.width ??= '35px'
        break
      case 'number':
        config.align ??= 'right'
        break
      case 'price':
        config.align ??= 'right'
        config.format ??= { isInteger: false, min: 2, max: 2 }
        break
      case 'input':
        attr.placeholder ??= '请输入'
        if (attr.type === 'number') {
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
    }
    config.child && addColumnsDefaultConfig(config.child)
    return config
  })
}
