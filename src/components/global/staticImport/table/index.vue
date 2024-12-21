<template>
  <div class="c-overflow-auto">
    <component
      :is="matchMap[curType]"
      :data="data"
      :columnsConfig="newColumnsConfig"
      :tableConfig="newTableConfig"
      v-bind="$attrs"
      ref="tableInstance"
    >
      <!-- 插槽向下传递 -->
      <template v-for="(_, name) in $slots" #[name]="row">
        <slot :name="name" v-bind="row" />
      </template>
    </component>
  </div>
</template>

<script setup lang="tsx">
import { type Component, type PropType, watch, shallowRef, type ShallowRef } from 'vue'
import Table from './Table.vue'
import { addColumnsDefaultConfig, addTableDefaultConfig } from './addDefaultConfig'
import { addVirColumnsDefaultConfig, addVirTableDefaultConfig } from './addVirDefaultConfig'
import VirTable from './VirTable.vue'
import { type Column } from 'element-plus'

export type TableInstance<T extends 'table' | 'virTable'> = T extends 'table'
  ? InstanceType<typeof Table> | null
  : InstanceType<typeof VirTable> | null
export type RowClassParam = { columns: Column<any>[]; rowData: any; rowIndex: number }
type RowClassGetter = (_param: RowClassParam) => string
type LazyParams = { pageIndex: number; pageSize: number }
type LazyOption = {
  enable: boolean // 是否开启数据懒加载
  maxPageSize: number // 页面可视区域最大行数
  asyncRequestFn: (_params: LazyParams) => { data: unknown[]; totalCount: number; code: number } // 请求函数
}

export type TableConfig = {
  type?: 'table' | 'virTable' // 用于判断表格类型，table（默认，普通表格）/virTable(虚拟化表格)
  /* table */
  height?: string
  width?: string
  stripe?: boolean
  border?: boolean
  'table-layout'?: string
  on?: Record<string, Function> // 批量绑定事件
  isCustomFooter?: boolean // 是否显示表尾合计行
  footerMethod?: Function // 自定义合计行累加方法，参数为当前 porp 和当前列数据
  style?: AnyObject
  'highlight-current-row'?: boolean
  'show-summary'?: boolean
  'summary-method'?: Function
  /* virTable */
  fixed?: boolean
  'header-height'?: number
  'row-class'?: RowClassGetter
  lazyOption?: LazyOption // 数据懒加载配置
  selectRowOnClick?: boolean // 为 true 时点击行自动勾选行筛选框
  isChildSlot?: boolean
}

export type ColumnsConfigObj = {
  /* table */
  type?: string // 当前列将格式化的类型，selection/expand
  prop?: string // 用于和数据的字段名匹配
  label?: string // 表格列标题
  width?: number | string
  align?: string
  child?: ColumnsConfig // 设置多级表头时需配置
  'show-overflow-tooltip'?: boolean // 禁止多行配置，默认超出悬浮 tooltip 提示
  'highlight-current-row'?: boolean // 高亮当前行
  slotName?: string // 插槽命名(列)，包括index/number/price/date/datetime/input/select/treeSelect/datePicker/addArrow
  slotParams?: AnyObject // 插槽数据传递（列）
  slotAttr?: AnyObject // 批量绑定属性(列)
  slotOn?: Record<string, Function> // 批量绑定事件(列)
  headerSlotName?: string // 插槽命名（表头）
  headerSlotParams?: AnyObject // 插槽数据传递（表头）
  headerSlotAttr?: AnyObject // 批量绑定属性（表头）
  headerSlotOn?: Record<string, Function> // 批量绑定事件（表头）
  hide?: boolean // 是否隐藏列
  /* virTable */
  key?: string // 当前列将格式化的类型，selection/index/input
  dataKey?: string // 用于和数据的字段名匹配。注意大小写，为小驼锋写法
  keyParams?: AnyObject
  title?: string // 表格列标题
  options?: AnyObject[] // 下拉框配置项
  config?: AnyObject // 配置信息
  cellRenderer?: Function // 单元格内容格式化
  rawCellRenderer?: Function // 单元格内容格式化(初始值)
  headerCellRenderer?: Function // 表头内容格式化
  mergeColumn?: boolean // 是否合并列（数据相同且相邻的单元格自动合并）
  style?: AnyObject // 自定义单元格样式
}
export type ColumnsConfig = ColumnsConfigObj[]
const matchMap: Record<string, Component> = {
  table: Table,
  virTable: VirTable
}
const props = defineProps({
  data: {
    type: Array<AnyObject>,
    required: true
  },
  tableConfig: {
    type: Object as PropType<TableConfig>,
    default: () => ({ height: '100%', width: '100%', lazyOption: { enable: false } })
  },
  columnsConfig: {
    type: Object as PropType<ColumnsConfig>,
    required: true
  }
})

// 获取表格子组件实例
const curType = props.tableConfig && props.tableConfig.type ? props.tableConfig.type : 'table'
const tableInstance = curType === 'table' ? shallowRef<TableInstance<'table'>>(null) : shallowRef<TableInstance<'virTable'>>(null)
let newTableConfig: TableConfig, newColumnsConfig: ColumnsConfig
const addDefaultConfig = () => {
  switch (curType) {
    case 'table':
      newTableConfig = addTableDefaultConfig(props.tableConfig)
      newColumnsConfig = addColumnsDefaultConfig(props.columnsConfig)
      break
    case 'virTable':
      newTableConfig = addVirTableDefaultConfig(props.tableConfig, tableInstance as ShallowRef<TableInstance<'virTable'>>)
      newColumnsConfig = addVirColumnsDefaultConfig(props.columnsConfig, props.data)
      break
  }
}

// 组件初始化时，添加默认配置
addDefaultConfig()

// props 更新时，同步更新默认配置
watch(props, () => addDefaultConfig())

// 将组件实例暴露出去
function getInstance() {
  return tableInstance.value?.table
}

defineExpose({ instance: getInstance(), getInstance })
</script>

<style scoped lang="scss">
// input 内的文字靠右
:deep(.input-text-right input) {
  text-align: right;
}
</style>
