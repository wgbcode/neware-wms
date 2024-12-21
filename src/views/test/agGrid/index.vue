<template>
  <div class="c-flex-column">
    <c-search v-model:data="queryList" :config="queryConfig" />
    <c-ag-table
      ref="agTable"
      :config="tableConfig"
      :data="data"
      :columns="columns"
      :loading="loading"
      v-model:selectedInfo="selectedInfo"
      @scrollToEnd="addTableData"
      @customServerSort="serverSortHandler"
      class="c-flex-1"
    />
  </div>
</template>

<script setup lang="tsx">
import { shallowRef, defineComponent, useTemplateRef } from 'vue'
import { numberFormat } from '@/utils/format'
import TestCell from './TestCell.vue'
import ChildTable, { type UpdateParentParams } from './ChildTable.vue'
import type { ValueParserParams } from 'ag-grid-community'
import type { ValueFormatterParams } from 'ag-grid-community'
import { ElMessage } from 'element-plus'

type RowData = {
  [key: string]: any
}
const loading = shallowRef<boolean>(false)
const data = shallowRef<RowData[]>([])
const fullWidthRowData = shallowRef<RowData[]>([])
const childrenData = shallowRef<RowData[]>([])
const agTable = useTemplateRef<AgGridInstance<RowData>>('agTable')
const selectedInfo = shallowRef<AgSelectedInfo<RowData>>({ isSelectAll: false, selectedData: [] })

for (let index = 0; index < 10; index++) {
  childrenData.value.push({
    test1: 123456,
    test2: new Date(),
    test3: new Date(),
    'test4-1': 'define 组件1',
    'test4-2': 'define 组件2',
    test5: 'Model Y',
    test6: 666,
    test7: 888,
    test8: 'Model',
    test9: 'Model',
    test10: 'Model',
    test11: 123456,
    test12: 123456,
    test13: true,
    test14: true,
    test15: true,
    'custom-index': ''
  })
}
for (let index = 0; index < 8; index++) {
  fullWidthRowData.value.push({
    checked: [2, 4, 5].includes(index),
    test1: `test`,
    test2: ['test1', 'test1', 'test2', 'test2', 'test3', 'test3', 'test4', 'test4'][index],
    test3: ['test1', 'test1', 'test1', 'test2', 'test2', 'test2', 'test2', 'test3'][index],
    test4: 'test4',
    test5: 'test5'
  })
}
for (let index = 0; index < 10000; index++) {
  data.value.push({
    checked: [1, 2, 5, 7, 8].includes(index),
    'test0-1': 123456 + '-' + (index + 1),
    'test0-2': 123456 + '-' + (index + 1),
    children: childrenData.value,
    fullWidthRowData: fullWidthRowData.value
  })
}

const defineChildTable = defineComponent({
  props: { params: { type: Object as AgParams<RowData>, required: true } },
  setup(props) {
    const updateFullWidthData = ({ id, data }: UpdateParentParams) => {
      const preNode = agTable.value!.getRowNode(id - 1)
      const curNode = agTable.value!.getRowNode(id)
      preNode.updateData({ ...preNode.data, fullWidthRowData: data })
      curNode.updateData({ ...curNode.data, fullWidthRowData: data })
    }
    return () => <ChildTable params={props.params} updateParentData={updateFullWidthData} />
  }
})

const tableConfig: AgTableConfig = {
  lazyEnable: false, // 开启后，滚动条滚动到底部会触发 scrollToEnd 事件，用于实现数据懒加载功能
  serverSortEnable: true, // 开启后，点击表头排序图标会触发 customServerSort 事件，为 null 时不触发
  autoSelectRowByChecked: true, // 开启后，在组件初始化时，根据行字段 checked 自动选中行
  attr: {
    fullWidthCellRenderer: defineChildTable,
    context: {
      isDefaultExpandAllFullWidthRow: false, // 是否默认展开所有跨网格行组件（或者使用 defaultExpandFullWidthRowIndex 默认展开部分；跨网格行组件数据必须放到字段 fullWidthRowData 中）
      isDefaultExpandTreeData: false // 是否默认展开所有树形数据
    }
  },
  on: {} // 放置给表格绑定的所有事件
}

function serverSortHandler({ colId, sort }: Record<string, string>) {
  console.log({ colId, sort })
  // 重新获取数据
  updateTableData()
}

// 自定义组件
const testCellRender = defineComponent({
  props: { params: { type: Object as AgParams<RowData>, required: true } },
  setup(props) {
    const { value } = props.params
    return () => <div>{value}</div>
  }
})
const test12Formatter = (params: ValueFormatterParams) => {
  return params.value ? 'SE-' + params.value : ''
}
const clickHandler = ({ row }: TableEvenParams<RowData>) => alert(`我的值是${row.make}`)
const columns = shallowRef<AgColumnConfig[]>([
  { compName: 'fullWidthRowExpand', pinned: 'left', width: 30 }, // 跨网格行组件展开和隐藏（使用该组件时，行高是动态的，向上滚动页面渲染性能会差一些，可注释切换为静态行高模式，静态行高默认20px；滚动到指定行也还需要优化）
  {
    headerName: '',
    field: 'test0-1',
    width: 30,
    compName: 'treeExpand', // 树形数据展开和隐藏(表头和内容为空)
    pinned: 'left',
    context: { compOption: { isEmptyText: true } }
  },
  { type: 'checked', pinned: 'left' },
  { type: 'index', pinned: 'left' },
  {
    headerName: '展开',
    field: 'test0-2',
    width: 100,
    compName: 'treeExpand', // 树形数据展开和隐藏(表头和内容不为空)
    pinned: 'left'
  },
  { headerName: '金额', field: 'test1', width: 80, formatType: 'price', sortable2: 'custom' },
  {
    headerName: '箭头',
    field: 'test1',
    width: 100,
    compName: 'arrow', // 树形数据展开组件
    // 组件和格式化函数需要用到的自定义属性，都放到 context 中
    context: { formatTextFn: numberFormat, click: clickHandler }, // 上下文
    pinned: 'left' // 左冻洁
  },
  {
    headerName: '日期',
    field: 'test2',
    align: 'center', // 单元格内容对齐方式
    width: 120,
    formatType: 'date',
    sortable2: 'custom', // 服务端排序
    pinned: 'left'
  },
  { headerName: '时间', field: 'test3', width: 180, formatType: 'dateTime' },
  {
    headerName: '自定义组件1',
    field: 'test4-1',
    width: 120,
    cellRenderer: TestCell // 写法1
  },
  {
    headerName: '自定义组件2',
    field: 'test4-2',
    width: 120,
    cellRenderer: testCellRender // 写法2
  },
  // 在提交数据时，记得调用 stopEditing 方法停止编辑并保存数据
  {
    headerName: '输入框(单击)',
    field: 'test5',
    width: 150,
    editable: true,
    singleClickEdit: true, // 单击开始编辑，默认双击
    valueSetter: (params) => {
      // 保存时自动格式化，并且可以校验数据
      const regex = /^-?\d+(\.\d+)?$/
      if (regex.test(params.newValue)) {
        params.data.test5 = Number(params.newValue)
        return true
      } else {
        ElMessage({ type: 'warning', message: '只能输入数字格式字符，请重新输入' })
        return false
      }
    }
  },
  {
    headerName: '数字输入框（双击）',
    field: 'test6',
    width: 150,
    align: 'right',
    editable: true,
    cellEditor: 'agNumberCellEditor',
    cellEditorParams: { min: 0, max: 100 }
  },
  {
    headerName: '输入框（自动格式化）',
    field: 'test7',
    width: 180,
    editable: true,
    valueParser: (params: ValueParserParams) => Number(params.newValue)
  },
  { headerName: '输入框（最大长度）', field: 'test8', width: 180, editable: true, cellEditorParams: { maxLength: 10 } },
  {
    headerName: '文本弹出框',
    field: 'test9',
    width: 150,
    editable: true,
    cellEditor: 'agLargeTextCellEditor',
    cellEditorPopup: true,
    cellEditorParams: { maxLength: 100 }
  },
  {
    headerName: '下拉选择框',
    field: 'test10',
    width: 150,
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['English', 'Spanish', 'French', 'Portuguese', '(other)']
    }
  },
  { headerName: '单元格内容格式化', field: 'test12', width: 150, valueFormatter: test12Formatter },
  { field: 'test13', width: 100 },
  { field: 'test14', width: 100 },
  { field: 'test15', width: 100 }
])

const queryList = shallowRef<QueryList>({})
const queryConfig = [
  { name: 'button', text: '获取表格最新数据', attr: { type: 'primary' }, on: { click: getTableData } },
  { name: 'button', text: '获取选中的行数据', attr: { type: 'primary' }, on: { click: getSelectedRowData } },
  { name: 'button', text: '更新表格数据', attr: { type: 'primary' }, on: { click: updateTableData } },
  { name: 'button', text: '更新单行数据', attr: { type: 'primary' }, on: { click: updateSingleRowData } },
  { name: 'button', text: '更新单行单个单元格数据', attr: { type: 'primary' }, on: { click: updateSingleCellData } },
  { name: 'button', text: '追加一万行数据', attr: { type: 'primary' }, on: { click: addTableData } }
]

const totalCount = shallowRef<number>(10000)

// 获取表格最新数据
function getTableData() {
  agTable.value!.gridApi.stopEditing() // 重要：手动停止编辑，保存编辑数据
  console.log('表格最新数据：', agTable.value!.instance.getRowData())
}

// 获取选中的行数据
function getSelectedRowData() {
  console.log(
    '选中的行数据',
    agTable.value!.gridApi.getSelectedRows().filter((i) => !i.isFullWidthRow)
  )
}

// 更新表格数据
let count = 0
function updateTableData() {
  // 模拟异步请求
  loading.value = true
  setTimeout(() => {
    const newData = data.value.map((item) => ({ ...item, test4: `我已经更新${count}次了~` }))
    // setGridOption 是封装后的同名方法，会自动添加唯一标识 id
    agTable.value!.gridApi.setGridOption('rowData', newData)
    loading.value = false
    count++
  }, 200)
}

// 更新单行数据
function updateSingleRowData() {
  const rowNode = agTable.value!.getRowNode(0) // 根据唯一标识 id 匹配
  const newData = { ...data.value[0], test5: 'Row: 我被更新了~' }
  rowNode.updateData(newData) // 更新行数据
  // agTable.value.gridApi.refreshCells({ force: true, rowNodes: [rowNode] }) // 强行刷新行（更新失败时使用）
}

// 更新单行单个单元格数据
function updateSingleCellData() {
  const rowNode = agTable.value!.getRowNode(0) // 根据唯一标识 id 匹配
  rowNode.setDataValue('test7', 'Cell: 我被更新了~')
}

// 追加1000行数据
function addTableData() {
  const newData = data.value.slice(0, 10000).map((item) => ({ ...item, test4: `我是追加的数据~` }))
  // applyTransaction 是封装后的同名方法，会自动全选和自动添加唯一标识 id
  agTable.value!.applyTransaction(newData)
  totalCount.value += 10000
}
</script>
