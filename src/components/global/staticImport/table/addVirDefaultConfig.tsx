import type { TableConfig, ColumnsConfig, RowClassParam, TableInstance, ColumnsConfigObj } from './index.vue'
import { type FunctionalComponent, type ShallowRef, shallowRef } from 'vue'
import { ElCheckbox, ElInput, ElSelect, ElOption, ElDatePicker } from 'element-plus'
import { type CheckboxValueType, type Column } from 'element-plus'
import { virScrollHandler } from './virScrollHandler'
import { numberFormat } from '@/utils/format'

type CellRenderProps<T = any> = {
  cellData: T
  column: Column<T>
  columns: Column<T>[]
  columnIndex: number
  rowData: any
  rowIndex: number
}

export type ScrollParams = {
  xAxisScrollDir: 'forward' | 'backward'
  scrollLeft: number
  yAxisScrollDir: 'forward' | 'backward'
  scrollTop: number
}

export const addVirTableDefaultConfig = (tableConfig: TableConfig | undefined, tableInstance: ShallowRef<TableInstance<'virTable'>>) => {
  const config = (tableConfig ??= {})
  config.fixed ??= true
  config['header-height'] ??= 20
  config['row-class'] ??= (params) => setRowClass(params, config)
  config.on ??= {}
  // 表格数据懒加载配置(组件初始化和滚动时都会触发回调函数), 使用示例参考 /src/views/test/commonVirTable/index.vue
  config.on.scroll ??= (params: ScrollParams) => virScrollHandler(params, config, tableInstance)
  return config
}

// 添加行 class
function setRowClass(params: RowClassParam, config: TableConfig | undefined): string {
  // 添加斑马纹
  const stripe = config?.stripe
  const { rowIndex } = params
  const isOdd = rowIndex % 2 === 0
  return stripe && !isOdd ? 'add-stripe-bg' : ''
}

export const addVirColumnsDefaultConfig = (columnsConfig: ColumnsConfig, tableData: Array<AnyObject>) => {
  let cellRenderer: Function
  return columnsConfig.flatMap((config, index) => {
    // 判断是否要隐藏列
    if (config.hide) {
      return []
    } else {
      config.key ??= config.dataKey
      config.key = config.key + '-' + index // 加上 index，确保 key 唯一
      if (config.cellRenderer && !config.rawCellRenderer) {
        config.rawCellRenderer = config.cellRenderer
      }
      switch (config.key.split('-')[0]) {
        case 'selection':
          config.width ??= 35
          config.align ??= 'center'
          config.cellRenderer = selectionRender
          config.rawCellRenderer = selectionRender
          break
        case 'index':
          config.title ??= '#'
          config.width ??= 35
          config.align ??= 'center'
          cellRenderer = ({ rowIndex }: Partial<CellRenderProps>) => (rowIndex ? rowIndex + 1 : 1)
          config.cellRenderer = cellRenderer
          config.rawCellRenderer = cellRenderer
          break
        case 'price':
          config.align ??= 'right'
          cellRenderer = ({ cellData }: Partial<CellRenderProps>) => {
            const emptyText = config?.keyParams?.emptyText
            const result = numberFormat(cellData)
            return emptyText && Number(result) === 0 ? emptyText : result
          }
          config.cellRenderer = cellRenderer
          config.rawCellRenderer = cellRenderer
          break
        case 'input':
          config.width ??= 140
          config?.keyParams?.type === 'price' && (config.align ??= 'right')
          config.cellRenderer = inputRender
          config.rawCellRenderer = inputRender
          break
        case 'select':
          config.width ??= 140
          config.cellRenderer = selectRender
          config.rawCellRenderer = selectRender
          break
        case 'datePicker':
          config.width ??= 200
          config.cellRenderer = datePickerRender
          config.rawCellRenderer = datePickerRender
          break
      }
      // 将字符串 width 转换成数字
      typeof config.width === 'string' && (config.width = Number(config.width))
      // 合并列单元格
      mergeColumnCell(config, tableData)
      return config
    }
  })
}

// 合并列单元格
function mergeColumnCell(config: ColumnsConfigObj, tableData: Array<AnyObject>) {
  const { mergeColumn, cellRenderer, rawCellRenderer } = config
  if (mergeColumn && tableData.length > 0) {
    if (!cellRenderer && !rawCellRenderer) {
      config.rawCellRenderer = (args: CellRenderProps) => {
        const { column, rowData } = args
        const dataKey = String(column.dataKey)
        return rowData[dataKey]
      }
    }
    // 在外面套一个 div，然后重新设置样式
    config.cellRenderer = (args: CellRenderProps) => {
      if (tableData[args.rowIndex]) {
        const { elClass, elStyle } = getMergeParams(tableData, args)
        return (
          <div class={elClass} style={elStyle}>
            {config.rawCellRenderer!(args)}
          </div>
        )
      } else {
        return config.rawCellRenderer!(args)
      }
    }
  }
}
function getMergeParams(tableData: Array<AnyObject>, args: CellRenderProps) {
  const { column, rowIndex } = args
  const dataKey = String(column.dataKey)
  const isFirstCell = rowIndex === 0 || tableData[rowIndex][dataKey] !== tableData[rowIndex - 1][dataKey]
  const elClass = isFirstCell ? 'merge-first-cell' : 'merge-next-cell'
  let elStyle: Record<string, string> = {}
  if (isFirstCell) {
    let nextCount = 0
    for (let i = 0; i < tableData.length; i++) {
      if (i >= rowIndex + 1) {
        if (tableData[i][dataKey] === tableData[rowIndex][dataKey]) {
          nextCount++
        } else {
          break
        }
      }
    }
    elStyle = { height: (nextCount + 1) * 20 - 1 + 'px', display: 'flex', 'align-items': 'center' }
  }
  return { dataKey, elClass, elStyle }
}

// 复选框
type SelectionCellProps = {
  value: boolean
  intermediate?: boolean
  onChange: (_value: CheckboxValueType) => void
  key: number
}
const refreshKey = shallowRef<number>(0)
const SelectionCell: FunctionalComponent<SelectionCellProps> = ({ value, intermediate = false, onChange }) => {
  return <ElCheckbox onChange={onChange} modelValue={value} indeterminate={intermediate} />
}
function selectionRender({ rowData }: CellRenderProps) {
  const onChange = (value: CheckboxValueType) => {
    rowData.checked = value
    refreshKey.value++ // 强制刷新
  }
  return <SelectionCell value={rowData.checked} onChange={onChange} key={refreshKey.value} />
}

// input
function inputRender({ rowData, column, columns }: CellRenderProps) {
  const dataKey = String(column.dataKey)
  const { type, suffixProp } = column.keyParams ?? {}
  const config = columns.flatMap((i) => (i.dataKey === column.dataKey ? (i.config ?? {}) : []))[0]
  const enterEdit = () => (rowData[`edit-${dataKey}`] = true)
  const exitEdit = () => (rowData[`edit-${dataKey}`] = false)
  const exitEdit2 = (e: Event) => {
    if ('code' in e && e.code === 'Enter') {
      rowData[`edit-${dataKey}`] = false
    }
  }
  const setRef = (el: any) => el && el.focus?.()
  return (
    <div class="c-flex-ycenter c-w100p c-h100p">
      {rowData[`edit-${dataKey}`] ? (
        <ElInput
          ref={setRef}
          v-model={rowData[dataKey]}
          onBlur={exitEdit}
          onKeydown={exitEdit2}
          placeholder={config?.placeholder ?? '请输入'}
          class={type === 'price' && 'input-text-right'}
        />
      ) : (
        <div class="c-w100p c-h100p c-flex-ycenter" onClick={enterEdit} style={type === 'price' && 'justify-content:flex-end'}>
          {type === 'price' ? numberFormat(rowData[dataKey]) : rowData[dataKey]}
        </div>
      )}
      {suffixProp && (
        <span style={`color:var(--el-text-color-placeholder);${rowData[`edit-${dataKey}`] && 'padding-right:4px'}`} class="c-ml4">
          {rowData[suffixProp]}
        </span>
      )}
    </div>
  )
}

// select
function selectRender({ rowData, column }: CellRenderProps) {
  const dataKey = String(column.dataKey)
  const options = column?.options ?? []
  const config = column?.config ?? {}
  const enterEdit = () => (rowData[`edit-${dataKey}`] = true)
  const exitEdit = () => (rowData[`edit-${dataKey}`] = false)
  const setRef = (el: any) => el && el.focus?.()
  return rowData[`edit-${dataKey}`] && options.length > 0 ? (
    <ElSelect ref={setRef} v-model={rowData[dataKey]} onChange={exitEdit} onBlur={exitEdit} placeholder={config?.placeholder ?? '请选择'}>
      {options.map((item: AnyObject) => {
        return <ElOption key={item.value} label={item.label} value={item.value} />
      })}
    </ElSelect>
  ) : (
    <div class="c-w100p c-h100p" onClick={enterEdit}>
      {rowData[dataKey]}
    </div>
  )
}

// datePicker
function datePickerRender({ rowData, column }: CellRenderProps) {
  const dataKey = String(column.dataKey)
  const config = column?.config ?? {}
  const placeholder = config.placeholder ?? '请选择'
  const type = config.type ?? 'date'
  let format = config.format
  if (!format) format = type === 'date' ? 'YYYY.MM.DD' : 'YYYY.MM.DD hh:mm:ss'
  const enterEdit = () => (rowData[`edit-${dataKey}`] = true)
  const exitEdit = () => (rowData[`edit-${dataKey}`] = false)
  const setRef = (el: any) => el && el.focus?.()
  return rowData[`edit-${dataKey}`] ? (
    <ElDatePicker
      ref={setRef}
      type={type}
      v-model={rowData[dataKey]}
      placeholder={placeholder}
      format={format}
      value-format={format}
      // @ts-ignore
      onChange={exitEdit}
      onBlur={exitEdit}
    />
  ) : (
    <div class="c-w100p c-h100p" onClick={enterEdit}>
      {rowData[dataKey]}
    </div>
  )
}
