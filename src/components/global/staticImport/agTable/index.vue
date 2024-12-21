<template>
  <!-- 父级元素高度和宽度需固定；或者直接给组件设置固定宽高 -->
  <div style="height: 100%; width: 100%; padding: 0 10px 0 0" v-loading="loading">
    <ag-grid-vue
      ref="agGrid"
      v-bind="newAttrs ?? {}"
      v-on="config.on ?? {}"
      :rowData="newData"
      :columnDefs="newColumns"
      style="width: 100%; height: 100%"
      class="ag-grid ag-theme-alpine-dark"
      :headerHeight="20"
      @grid-ready="onGridReady"
      rowSelection="multiple"
      :suppressRowClickSelection="true"
      @bodyScroll="debounceScrollHandler"
      @sortChanged="serverSortHandler"
      @selectionChanged="selectedHandler"
      :scrollbarWidth="8"
      :enableCellTextSelection="true"
      :isFullWidthRow="isFullWidthRow"
      @rowClicked="rowClickedHandler"
      :tooltipShowDelay="0"
      @modelUpdated="modelUpdatedHandler"
      :suppressRowTransform="true"
      :rowClassRules="rowClassRules"
    >
    </ag-grid-vue>
  </div>
</template>

<script setup lang="tsx">
// 官方文档：https://www.ag-grid.com/vue-data-grid/getting-started/
// 参考示例1：src/views/test/agGrid/index.vue
// 参考示例2：src/views/finance/salereceivable/index.vue

import { type Component, computed, shallowRef, useTemplateRef, type PropType, nextTick } from 'vue'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import '@/styles/theme-ag-table.scss' // 重置表格样式
import { AgGridVue } from 'ag-grid-vue3'
// import 'ag-grid-charts-enterprise' // 正版需要购买，且版本需和 ag-grid-vue3 保持一致
import ArrowCell from './components/ArrowCell.vue'
import TreeExpandCell from './components/TreeExpandCell.vue'
import FullWidthRowExpandCell from './components/FullWidthRowExpandCell.vue'
import { numberFormat, dateFormat } from '@/utils/format'
import { debounce } from 'lodash-es'
import type {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ColumnEvent,
  BodyScrollEvent,
  ValueFormatterParams,
  IsFullWidthRowParams,
  RowHeightParams,
  ColDef,
  CheckboxSelectionCallbackParams,
  ITooltipParams,
  RowClickedEvent,
  IRowNode,
  SelectionChangedEvent,
  SelectionEventSourceType,
  RowSpanParams,
  CellClassParams
} from 'ag-grid-community'
import { getTextWidthByCanvas } from '@/utils/common'

type RowData = {
  id: number // 行唯一标识
  index: number // 行序号
  isExpandTreeData?: boolean // 是否展开行数据
  alreadyExpandFullWidthRow?: boolean // 是否展开跨网格行组件
  isFullWidthRow?: boolean // 是否是跨网格行组件
  checked?: boolean // 表格会根据 checked 自动选中和取消选中行（autoSelectRowByChecked 需设置为 true）
  children?: RowData[] // 树型数据存放字段
  fullWidthRowData?: AnyObject[] // 行展开组件数据存放字段
  rowSpanData?: Record<Partial<keyof RowData>, number> // 自动合并列单元格配置字段
  cellClassRulesData?: Record<Partial<keyof RowData>, string> // 自动合并列单元格配置字段
  [key: string]: any
}
export interface AgCustomColumnConfig extends ColDef {
  type?: 'index' | 'checked'
  compName?: 'arrow' | 'treeExpand' | 'fullWidthRowExpand'
  formatType?: 'price' | 'date' | 'dateTime' | 'number'
  align?: 'left' | 'center' | 'right'
  sortable2?: boolean | 'custom' // 同时支持服务端排序和客户端排序
  autoMergeCol?: boolean // 开启后，会自动合并列单元格（相同内容；autoMergeColOption 中可添加其它配置）
}
// 由于推断类型存在最大长度限制，故使用 AgGridOptions 替代 GridOptions
// 但传入的类型还必须是 GridOptions，否则会类型报错（warning）
type AgGridOptions = {
  [key: string]: any
}
type AgCustomContext = {
  fullWidthCellRenderer?: any // 跨网格行组件
  context?: {
    fullWidthRowHeight?: number // 跨网格行组件高度
    isDefaultExpandTreeData?: boolean // 是否默认展开树形数据
    isDefaultExpandAllFullWidthRow?: boolean // 是否默认展开所有跨网格行组件
    defaultExpandFullWidthRowIndex?: number[] // 根据行 index 默认展开部分跨网格行组件
    hiddenIconOfEmptyFullWidthRow?: boolean // 跨网格行组件数据为空时，不显示展开隐藏 icon
  }
}
export type AgCustomTableConfig = {
  serverSortEnable?: boolean // 用于开启服务端排序功能(点击表头排序图标会触发 customServerSort 事件)
  lazyEnable?: boolean // 用于开启滚动时数据懒加载功能(滚动到底部会触发 scrollToEnd 事件)
  autoSelectRowByChecked?: boolean // 用于在组件初始化时，根据行字段 checked 自动选中行功能
  forbidAutoSelectRowOnClick?: boolean // 点击行自动选中
  forbidStriped?: boolean // 是否禁止斑马纹
  autoMergeFollowFirstColumn?: boolean // 自动合并列单元格的 rowSpan 是否都跟随第一列
  attr?: AgCustomContext & AgGridOptions // 所有绑定到表格的属性
  on?: AgGridOptions // 所有绑定到表格的事件
}

const props = defineProps({
  data: {
    type: Array<RowData>,
    required: true
  },
  columns: {
    type: Array<AgCustomColumnConfig>,
    required: true
  },
  config: {
    type: Object as PropType<AgCustomTableConfig>,
    default: () => ({
      serverSortEnable: false,
      lazyEnable: false,
      forbidStriped: false,
      forbidAutoSelectRowOnClick: false,
      autoSelectRowByChecked: false,
      autoMergeFollowFirstColumn: false,
      attr: {
        context: {
          fullWidthRowHeight: 0,
          isDefaultExpandTreeData: false,
          isDefaultExpandAllFullWidthRow: false,
          defaultExpandFullWidthRowIndex: [],
          hiddenIconOfEmptyFullWidthRow: false
        }
      },
      on: {}
    })
  },
  loading: {
    type: Boolean
  }
})
const emit = defineEmits(['scrollToEnd', 'customServerSort', 'update:selectedInfo', 'customSelectionChanged', 'updateParentData'])
const rowClassRules = computed(() => {
  return {
    'forbid-striped': () => !!props.config.forbidStriped
  }
})

// 自定义单元格组件
const componentMap: Record<string, Component> = {
  arrow: ArrowCell, // 箭头
  treeExpand: TreeExpandCell, // 树形数据展开
  fullWidthRowExpand: FullWidthRowExpandCell // 跨网格行组件展开
}

// 自定义单元格格式化函数
const formatFnMap: Record<string, Object> = {
  price: { valueFormatter: formatPrice, headerClass: 'c-cell-right', cellClass: 'c-cell-right' },
  date: { valueFormatter: (params: ValueFormatterParams) => dateFormat(params.value, 'YYYY.MM.DD') },
  dateTime: { valueFormatter: (params: ValueFormatterParams) => dateFormat(params.value, 'YYYY.MM.DD HH:mm:ss') },
  number: { valueFormatter: formatNumber, headerClass: 'c-cell-right', cellClass: 'c-cell-right' }
}
function formatPrice(params: ValueFormatterParams) {
  const emptyValue = params.colDef?.context?.emptyValue ?? ''
  const formatValue = numberFormat(params.value)
  return (emptyValue && Number(formatValue) === 0) || !params.value ? emptyValue : formatValue
}
function formatNumber(params: ValueFormatterParams) {
  const isInteger = params.colDef?.context?.isInteger ?? true // 默认是整数
  return numberFormat(params.value, isInteger)
}

// 自定义跨网格行组件
type IsFullWidthRow = (params: IsFullWidthRowParams) => boolean
type GetRowHeight = (params: RowHeightParams) => number | undefined | null
const isFullWidthRow = shallowRef<IsFullWidthRow | null>(null)
const getRowHeight = shallowRef<GetRowHeight | null>(null)
isFullWidthRow.value = (params: IsFullWidthRowParams) => {
  // isFullWidthRow 为 true 时为跨网格行组件
  return params.rowNode.data.isFullWidthRow
}
getRowHeight.value = (params: RowHeightParams) => {
  const { fullWidthRowData } = params.data
  const { fullWidthRowHeight } = props.config?.attr?.context ?? {}
  let calculateHeight = 200
  if (Array.isArray(fullWidthRowData)) {
    calculateHeight = fullWidthRowData.length === 0 ? 65 : (fullWidthRowData.length + 2) * 20
  }
  return params.data.isFullWidthRow ? fullWidthRowHeight || calculateHeight : 20
}

// 自定义 class
const classMap: Record<string, Object> = {
  left: { headerClass: 'c-cell-left', cellClass: 'c-cell-left' },
  center: { headerClass: 'c-cell-center', cellClass: 'c-cell-center' },
  right: { headerClass: 'c-cell-right', cellClass: 'c-cell-right' }
}

// 自定义 type
const typeMap: Record<string, Object> = {
  index: {
    headerName: '#',
    field: 'index',
    width: 40,
    headerClass: 'c-cell-center',
    cellClass: 'c-cell-center',
    valueFormatter: (params: ValueFormatterParams) => params.value + 1 || ''
  },
  checked: {
    field: '',
    width: 25,
    headerCheckboxSelection: true,
    showDisabledCheckboxes: true,
    checkboxSelection: (params: CheckboxSelectionCallbackParams) => {
      // 展开树形数据的当前行，禁止选中
      return params.data.isExpandTreeData ? false : true
    },
    headerClass: 'c-cell-center c-customer-checked',
    cellClass: 'c-cell-center'
  }
}

// 格式化初始的 data 和 columns
const newData = computed<RowData[]>(() => addExtraRowField(generateNewTableData(props.data)))
function generateNewTableData(tableData: RowData[]) {
  const { isDefaultExpandTreeData, isDefaultExpandAllFullWidthRow, defaultExpandFullWidthRowIndex, hiddenIconOfEmptyFullWidthRow } =
    props.config?.attr?.context ?? {}
  // 默认展开所有树形数据
  if (isDefaultExpandTreeData) {
    const flatData: RowData[] = []
    const generateItem = (item: RowData) => {
      if (item.children && item.children.length > 0) {
        // 添加展开标记
        flatData.push({ ...item, isExpandTreeData: true })
        item?.children.forEach((_item: RowData) => generateItem(_item))
      } else {
        flatData.push(item)
      }
    }
    tableData.forEach((item) => generateItem(item))
    return flatData
  }
  // isDefaultExpandAllFullWidthRow: 默认展开所有跨网格行组件
  // defaultExpandFullWidthRowIndex: 根据行 index，默认展开部分跨网格行组件
  if (isDefaultExpandAllFullWidthRow || defaultExpandFullWidthRowIndex) {
    let defaultExpandCount = 0
    return tableData.reduce<RowData[]>((pre, next, index) => {
      const isShowIcon = !hiddenIconOfEmptyFullWidthRow || (hiddenIconOfEmptyFullWidthRow && next.fullWidthRowData?.length !== 0)
      const needExpand = isDefaultExpandAllFullWidthRow || (!isDefaultExpandAllFullWidthRow && defaultExpandFullWidthRowIndex?.includes(index))
      if (needExpand && isShowIcon) {
        // alreadyExpandFullWidthRow 表示下一行是跨网格行组件(已经展开），用于控制展开 icon 的 name
        // isFullWidthRow 表示当前行就是跨网格组件，用于告诉 ag-grid 按设定和计算的逻辑渲染
        defaultExpandCount++
        const fullWidthRowData = next.fullWidthRowData?.map((i) => ({ ...i, fullWidthRowId: index + defaultExpandCount })) ?? []
        pre.push({ ...next, alreadyExpandFullWidthRow: true })
        pre.push({ ...next, isFullWidthRow: true, checked: false, fullWidthRowData })
      } else {
        pre.push({ ...next, alreadyExpandFullWidthRow: false })
      }
      return pre
    }, [])
  }
  return tableData
}

const newColumns = computed(() => {
  return props.columns.map((item) => {
    const cellRenderer = item.compName ? { cellRenderer: componentMap[item.compName] } : {}
    const valueFormatter = item.formatType ? formatFnMap[item.formatType] : {}
    const typeColumn = item.type ? typeMap[item.type] : {}
    const classColumn = item.align ? classMap[item.align] : {}
    const sortColumn =
      item.sortable2 === 'custom'
        ? { sortable: true, unSortIcon: true, comparator: () => 0 } // 服务端排序（serverSortEnable 设置成 true）
        : { sortable: item.sortable2 || false, unSortIcon: true } // 客户端排序（serverSortEnable 设置成 false）
    const contextColumn = generateNewContext(item) // 上下文
    const tooltipColumn = { tooltipValueGetter } // tooltip
    const autoMergeColColumn = item.autoMergeCol ? generateMergeColColumn() : {}
    const result = Object.assign(
      {},
      item,
      cellRenderer,
      valueFormatter,
      typeColumn,
      classColumn,
      sortColumn,
      contextColumn,
      tooltipColumn,
      autoMergeColColumn
    )
    // 不允许给 ag-grid 组件绑定自定义属性
    // 如果组件和格式化函数需要用到自定义属性，请放到 context 中
    deleteCustomAttrs(result)
    return result
  })
})
// 文本宽度超出单元格宽度时，显示 tooltip
function tooltipValueGetter(params: ITooltipParams) {
  const { data, value } = params
  const colDef = params.colDef as ColDef
  const { width = 0, field = '' } = colDef
  const textWidt = field ? getTextWidthByCanvas(data[field]) : 0
  return textWidt + 12 > width ? value : null
}
// 自动合并列单元格配置
function generateMergeColColumn() {
  return {
    rowSpan: (params: RowSpanParams) => {
      const { data, colDef } = params
      return data.rowSpanData[colDef.field!]
    },
    cellClassRules: {
      'cell-span': (params: CellClassParams) => {
        const { data, colDef } = params
        return data.cellClassRulesData[colDef.field!]
      },
      'cell-span-start': (params: CellClassParams) => {
        const { data, colDef } = params
        return data.rowSpanData[colDef.field!] !== 1
      }
    }
  }
}

function generateNewContext(item: AgCustomColumnConfig) {
  const hasFullWidthRowExpand = props.columns.findIndex((i) => i.compName === 'fullWidthRowExpand') !== -1
  const context = item?.context ?? {}
  return { context: { ...context, hasFullWidthRowExpand } }
}
// 删除所有自定义属性
function deleteCustomAttrs(column: AgCustomColumnConfig) {
  const customAttrs: Array<keyof AgCustomColumnConfig> = ['compName', 'formatType', 'align', 'type', 'sortable2', 'autoMergeCol']
  customAttrs.forEach((attr) => {
    if (attr in column) {
      delete column[attr]
    }
  })
}

const newAttrs = computed(() => {
  const attr = props.config?.attr ?? { context: {} }
  // 默认行高设置为 20 px
  let rowHeightAttr: GridOptions = { rowHeight: 20 }
  // 判断是否是动态行高（使用动态行高时，向上滚动存在一定的性能问题）
  const isDynamicRowHeight = props.columns.findIndex((i: AgCustomColumnConfig) => i.compName === 'fullWidthRowExpand') !== -1
  if (isDynamicRowHeight) {
    rowHeightAttr = { getRowHeight: getRowHeight.value! }
  }
  return { ...attr, ...rowHeightAttr, context: { ...attr.context, getParentInstance: () => agGrid.value } }
})

// 开启数据懒加载功能后，滚动条滚动到底部时，会触发 scrollToEnd 事件
const debounceScrollHandler = debounce(scrollHandler, 150)
async function scrollHandler(event: BodyScrollEvent) {
  await nextTick()
  const length = agGrid.value?.getRowData()?.length ?? 0
  const clientHeight = agGrid.value?.$el.clientHeight
  const needEmitEvent = props.config.lazyEnable && event.top + clientHeight > 20 * length && event.top !== 0 && length !== 0 && clientHeight
  needEmitEvent && emit('scrollToEnd')
}

// 自定义排序事件。为 null 时不触发
export type AgServerSortParams = {
  colId: string
  sort: 'desc' | 'asc'
}
function serverSortHandler(event: ColumnEvent) {
  // 判断是否是服务端排序
  if (props.config.serverSortEnable) {
    const sortColumn = (event.columns as AgCustomColumnConfig[])?.filter((i) => i.sort)
    if (sortColumn && sortColumn.length === 1) {
      const { colId, sort } = sortColumn[0]
      emit('customServerSort', { colId, sort } as AgServerSortParams)
    }
  }
}

// 点击行自动选中或取消选中。官方 RowClickedEvent 类型有问题
function rowClickedHandler(event: RowClickedEvent) {
  if (!props.config.forbidAutoSelectRowOnClick) {
    const { api, node } = event
    // @ts-ignore
    api.setNodesSelected({ nodes: [node], newValue: !node.selected })
  }
}

// 获取表格实例和 API
const gridApi = shallowRef<GridApi>()
const agGrid = useTemplateRef<InstanceType<typeof AgGridVue>>('agGrid')
const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api
}

// 在表尾追加数据（结合数据懒加载功能使用）
const applyTransaction = (data: RowData[]) => {
  const { getSelectedRows, applyTransaction, selectAll } = gridApi.value!
  const isAllSelected = agGrid.value!.getRowData().length === getSelectedRows().length
  applyTransaction({ add: addExtraRowField(generateNewTableData(data), true) })
  isAllSelected && selectAll() // 自动全选
}

// 在组件初始化或者表格数据更新时执行
async function modelUpdatedHandler() {
  await nextTick()
  // 根据行字段 checked 自动选中行
  if (props.config.autoSelectRowByChecked) {
    const { getRowNode, setNodesSelected, getGridOption } = gridApi.value!
    const idxs = getGridOption('rowData')!.flatMap((i) => (i.checked ? i.id : []))
    const nodes = idxs.reduce<IRowNode[]>((pre, next) => {
      const node = getRowNode(String(next))
      node && pre.push(node)
      return pre
    }, [])
    // 会触发 selectedHandler 函数，event.source 为 api
    setNodesSelected({ nodes, newValue: true })
  }
}

const selectedHandler = async (event: SelectionChangedEvent) => {
  await nextTick()
  const { source } = event
  const tableData = agGrid.value!.getRowData()
  const selectedData = gridApi.value!.getSelectedRows().filter((i) => !i.isFullWidthRow)
  const isSelectAll = tableData.length === selectedData.length
  // 将表格选中信息回传到父级组件
  emit('update:selectedInfo', { isSelectAll, selectedData, source })
  emit('customSelectionChanged', { isSelectAll, selectedData, source })
  // 选中或取消行选中的同时，更新行字段 checked
  updateChecked({ source, tableData, selectedData })
}
interface UpdateCheckedParams {
  source: SelectionEventSourceType
  tableData: RowData[]
  selectedData: RowData[]
}
function updateChecked(params: UpdateCheckedParams) {
  const { source, tableData, selectedData } = params
  // 只会在点击复选框且在 autoSelectRowByChecked 开启时触发
  if (['uiSelectAll', 'checkboxSelected'].includes(source) && props.config.autoSelectRowByChecked) {
    const { getRowNode } = gridApi.value!
    tableData.forEach((item) => {
      const node = getRowNode(String(item.id))
      const isSelected = selectedData.map((i) => i.id).includes(item.id)
      node?.updateData({ ...item, checked: isSelected })
    })
    if ('fullWidthRowId' in tableData[0]) {
      const newTableData = agGrid.value!.getRowData()
      const { fullWidthRowId } = newTableData[0]
      // 子表数据更新时，通知父表同步更新行数据
      emit('updateParentData', { id: fullWidthRowId, data: newTableData })
    }
  }
}

// 添加额外的行字段，包括行唯一标识 id、行序号 index、rowSpanData、cellClassRulesData
function addExtraRowField(data: RowData[], isAdd?: boolean) {
  let fullWidthRowCount = 0
  const currentDataLength = isAdd ? agGrid.value!.getRowData().length : 0
  const result = data.map((item, index) => {
    item.isFullWidthRow && fullWidthRowCount++
    const id = currentDataLength + index
    const newIndex = id - fullWidthRowCount // 该 index 仅用于序号列显示
    const autoMergeCol = props.columns.findIndex((i) => i.autoMergeCol)
    const autoMergeColAttrs = autoMergeCol !== -1 ? getAutoMergeColAttrs(index, data) : {}
    return { ...item, id, index: newIndex, ...autoMergeColAttrs }
  })
  return result
}
function getAutoMergeColAttrs(currentIndex: number, data: RowData[]) {
  const { autoMergeFollowFirstColumn } = props.config
  const firstMergeField = props.columns.find((i) => i.autoMergeCol)?.field ?? ''
  const rowSpanData: Record<Partial<keyof RowData>, number> = {}
  const cellClassRulesData: Record<Partial<keyof RowData>, string> = {}
  props.columns.forEach((item) => {
    const { field, autoMergeCol } = item
    if (field && autoMergeCol) {
      const rulesValue = [...new Set(data.map((i) => `value===${i[field]}`))].join(' || ')
      Reflect.set(rowSpanData, field, 1) // 设置默认值
      Reflect.set(cellClassRulesData, field, rulesValue) // 设置固定值
      for (let i = currentIndex + 1; i < data.length; i++) {
        // 判断当前行和下一行数值是否相等
        if (data[currentIndex][field] === data[i][field]) {
          const baseNeed1 = currentIndex === 0 || data[currentIndex - 1][field] !== data[currentIndex][field]
          const baseNeed2 = field === firstMergeField && baseNeed1
          const baseNeed3 = field !== firstMergeField && rowSpanData[field] < rowSpanData[firstMergeField]
          // 合并不跟随第一列
          const needAdd1 = !autoMergeFollowFirstColumn && baseNeed1
          // 合并跟随第一列
          const needAdd2 = autoMergeFollowFirstColumn && (baseNeed2 || baseNeed3)
          if (needAdd1 || needAdd2) {
            Reflect.set(rowSpanData, field, rowSpanData[field] + 1) // 自动加 1
          }
        } else {
          break
        }
      }
    }
  })
  return { rowSpanData, cellClassRulesData }
}

// 获得行节点
const getRowNode = (index: number) => {
  return gridApi.value!.getRowNode(String(index))!
}

// 更新单元格数据
export type UpdateCellDataParmas<T = any> = {
  id: number
  field: string
  value: T
}
function updateCellData<T>(params: UpdateCellDataParmas<T>) {
  const { id, field, value } = params
  getRowNode(id).setDataValue(field!, value)
}

// 更新行数据
export type UpdateRowDataParmas<T = any> = {
  id: number
  value: T
}
function updateRowData<T>(params: UpdateRowDataParmas<T>) {
  const { id, value } = params
  getRowNode(id).updateData(value)
}

// 强制刷新行
function forceRefreshRow(rowId: number) {
  gridApi.value!.refreshCells({ force: true, rowNodes: [getRowNode(rowId)] })
}

// 将组件的属性或方法暴露出去
defineExpose({ instance: agGrid, gridApi, applyTransaction, getRowNode, updateCellData, updateRowData, forceRefreshRow })
</script>
