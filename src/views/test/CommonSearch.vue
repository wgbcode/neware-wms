<template>
    <div>
        <CommonSearch :data="queryList" :config="config" />
    </div>
</template>
  
<script setup lang="ts">
import { reactive, watch } from 'vue'

const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const options = Array.from({ length: 1000 }).map((_, idx) => ({
    value: `Option${idx + 1}`,
    label: `${initials[idx % 10]}${idx}`
}))
const onSearch = () => {
    console.log('查询')
}
const queryList = reactive({})
const config = [
    { name: 'input', prop: 'testInput', attr: { type: 'text' }, on: { keyup: onSearch } },
    { name: 'select', prop: 'testSelect', attr: { options } },
    { name: 'date', prop: 'testDate3', attr: { type: 'datetimerange', shortcuts: true } },
    { name: 'date', prop: 'testDate', attr: { shortcuts: true } },
    { name: 'date', prop: 'testDate2', attr: { type: 'daterange', shortcuts: true } },
    { name: 'date', prop: 'testDate5', attr: { type: 'monthrange', shortcuts: true } },
    { name: 'date', prop: 'testDate4', attr: { type: 'datetime', shortcuts: true } },
    { name: 'treeSelect', prop: 'treeSelect' },
    { name: 'button', text: '查询', attr: { type: 'primary' }, on: { click: onSearch } }
]
watch(queryList, (value) => console.log('val', value))
</script>
  