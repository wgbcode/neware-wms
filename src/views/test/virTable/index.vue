<template>
  <div class="c-flex-column">
    <c-search v-model:data="queryList" :config="config" />
    <c-table v-model:data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1"> </c-table>
  </div>
</template>

<!-- 推荐使用 AG_Grid -->
<script setup lang="tsx">
import { shallowRef, watch } from 'vue'

// 控制是否开启数据懒加载功能，默认开启
const openLazyLoading = false
const tableData = shallowRef<unknown[]>([])
let tableConfig: AnyObject = { type: 'virTable', stripe: true }
if (!openLazyLoading) {
  // 方式一: 一次性加载所有数据
  tableData.value = Array.from({ length: 1000 }).map((_, idx) => ({
    id: 'row-' + idx,
    parentId: null,
    checked: false,
    number: idx * 10,
    number2: idx * 20,
    inputTest: 123,
    selectTest: 'Option1',
    datePickerTest: '2023.01.01'
  }))
} else {
  // 方式二: 数据懒加载
  interface LazyParams {
    pageIndex: number
    pageSize: number
  }
  let count = 0
  // 数据懒加载请求回调函数(函数在组件初始化和滚动时会被调用)
  const asyncRequestFn = async (params: LazyParams) => {
    console.log('params', params) // 分页请求参数
    count++
    return await new Promise((resolve) => {
      let timer = setTimeout(() => {
        // data 为模拟接口请求回传数据
        const data = Array.from({ length: 41 }).map((_, idx) => ({
          id: 'row-' + idx,
          parentId: null,
          checked: false,
          number: idx * 10 * count,
          number2: idx * 20 * count,
          inputTest: 123 * count,
          selectTest: 'Option1',
          datePickerTest: '2023.01.01'
        }))
        const result = { data, totalCount: 100000, code: 200 }
        resolve(result)
        clearTimeout(timer)
      }, 1000)
    })
  }
  // 数据懒加载配置项
  const lazyOption = { enable: true, asyncRequestFn, maxPageSize: 41 }
  tableConfig = { ...tableConfig, lazyOption: lazyOption }
}

const selectOptions = [
  { value: 'Option1', label: 'Option1' },
  { value: 'Option2', label: 'Option2' },
  { value: 'Option3', label: 'Option3' }
]
const columnsConfig = [
  { key: 'selection' },
  { key: 'index' },
  { dataKey: 'test1', title: '数字', width: 150 },
  { dataKey: 'test2', title: '自定义图标', width: 150, cellRenderer: addIcon },
  { key: 'input', dataKey: 'test3', title: '输入框' },
  { key: 'select', dataKey: 'test4', title: '选择框', options: selectOptions },
  {
    key: 'datePicker',
    dataKey: 'test5',
    title: '日期选择器',
    config: { type: 'date', format: 'YYYY.MM.DD', placeholder: '请输入' }
  }
]
function addIcon({ cellData: name }: Record<string, number>) {
  return (
    <div class="c-flex-ycenter">
      {/*  @ts-ignore */}
      <Icon name="test" color="white" class="c-mr5" />
      <span>{name}</span>
    </div>
  )
}
watch(tableData, (value) => console.log('tableData', value))

// Search
const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const optionV2 = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `Option${idx + 1}`,
  label: `${initials[idx % 10]}${idx} `
}))
const queryList = shallowRef<QueryList>({})
const onSearch = () => console.log('查询参数', queryList)
const config = [
  { name: 'input', prop: 'testInput', attr: { type: 'text' }, on: { change: onSearch } },
  { name: 'select', prop: 'testSelect', attr: { optionV2 } },
  { name: 'date', prop: 'testDate', attr: { shortcuts: true } },
  { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: onSearch } }
]
watch(queryList, (value) => console.log('queryList', value))
</script>
