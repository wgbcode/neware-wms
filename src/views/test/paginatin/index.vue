<template>
  <div class="c-flex-column">
    <c-search v-model:data="queryList" :config="config" />
    <c-table v-model:data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1">
      <template #date="{ row }">
        <div>{{ row.date }}</div>
      </template>
      <template #name="{ row }">
        <div>{{ row.name }}</div>
      </template>
      <template #address="{ row }">
        <div>{{ row.address }}</div>
      </template>
      <template #expand>
        <div>请自定义插槽模板</div>
      </template>
    </c-table>
    <c-pagination v-if="tableData.length > 0" v-model:data="pagiData" @change="onSearch" />
  </div>
</template>

<script setup lang="ts">
import { watch, shallowRef, ref } from 'vue'

// Search
const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const optionV2 = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `Option${idx + 1}`,
  label: `${initials[idx % 10]}${idx}`
}))

const queryList = shallowRef<QueryList>({})
const onSearch = () => {
  console.log('查询参数1', queryList.value)
  console.log('查询参数2', pagiData.value)
}
const config = [
  { name: 'input', prop: 'testInput', attr: { type: 'text' }, on: { change: onSearch } },
  { name: 'select', prop: 'testSelect', attr: { optionV2 } },
  { name: 'date', prop: 'testDate', attr: { shortcuts: true } },
  { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: onSearch } }
]
watch(queryList, (value) => console.log('val', value))

// Table
const tableData = shallowRef(
  Array.from({ length: 50 }).map((_, idx) => ({
    id: idx,
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    number: idx * 100
  }))
)
const tableConfig = {
  height: '100%',
  width: '100%',
  isCustomFooter: true,
  footerMethod: footMethod
}
const columnsConfig = [
  { type: 'expand' },
  { type: 'selection' },
  { slotName: 'index' },
  { label: 'Date', prop: 'date', width: '200', slotName: 'addArrow', slotParams: { type: 'date' } },
  { label: 'address', prop: 'address', width: '200' },
  { label: 'number', prop: 'number', slotName: 'number', width: '150' },
  { label: 'name', prop: 'name', width: '150' }
]
function footMethod(prop: string, values: number[]) {
  let res = ''
  const textLabel = 'address'
  const numLabels = ['number']
  if (prop === textLabel) res = '合计'
  else if (!values.every((value) => Number.isNaN(value))) {
    numLabels.forEach((label) => {
      res = prop === label ? `${values.reduce((prev, curr) => (Number.isNaN(Number(curr)) ? prev : prev + curr), 0)}` : ''
    })
  }
  return res
}
watch(tableData, (value) => console.log('tableData', value))

// pagination
const pagiData = ref<PaginationData>({ page: 1, pageSize: 35, total: 500 })
watch(pagiData, (value) => console.log('pagiData', value))
</script>
