<template>
    <div>
        <CommonSearch :data="queryList" :config="config" />
        <CommonTable :data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1">
            <template #date="row">
                <div>{{ row.date }}</div>
            </template>
            <template #name="row">
                <div>{{ row.name }}</div>
            </template>
            <template #address="row">
                <div>{{ row.address }}</div>
            </template>
            <template #expand>
                <div>请自定义插槽模板</div>
            </template>
        </CommonTable>
        <CommonPaginatin v-show="tableData.length > 0" :config="paginationConfig" />
    </div>
</template>
  
<script setup lang="ts">
import { reactive, watch } from 'vue'

// Table
const tableData = reactive(Array.from({ length: 50 }).map((_, idx) => ({
    id: idx,
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    number: idx * 100
})))
const tableConfig = { height: '100%', width: '100%', isCustomFooter: true, footerMethod: footMethod }
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
watch(tableData, (value) => console.log('val', value))

// Search
const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const options = Array.from({ length: 1000 }).map((_, idx) => ({
    value: `Option${idx + 1}`,
    label: `${initials[idx % 10]}${idx}`
}))

const queryList = reactive({
    curPage: 1,
    pageSize: 100
})
const onSearch = () => {
    console.log('查询参数', queryList)
}
const config = [
    { name: 'input', prop: 'testInput', attr: { type: 'text' }, on: { keyup: onSearch } },
    { name: 'select', prop: 'testSelect', attr: { options } },
    { name: 'date', prop: 'testDate', attr: { shortcuts: true } },
    { name: 'button', text: '查询', attr: { type: 'primary' }, on: { click: onSearch } }
]
watch(queryList, (value) => console.log('val', value))

// pagination
const paginationConfig = reactive({
    curPage: queryList.curPage,
    pageSize: queryList.pageSize,
    total: 500,
    on: {
        'size-change': handleSizeChange,
        'current-change': handleCurChange
    }
})
function handleSizeChange(val: number) {
    queryList.pageSize = val
    paginationConfig.pageSize = val
    onSearch()
}
function handleCurChange(val: number) {
    queryList.curPage = val
    paginationConfig.curPage = val
    onSearch()
}
</script>
  