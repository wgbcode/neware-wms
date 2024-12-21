<template>
  <div>
    <c-search v-model:data="queryList" :config="config" />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, watch } from 'vue'

const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const optionV2 = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `Option${idx + 1}`,
  label: `${initials[idx % 10]}${idx}`
}))
const onSearch = () => console.log('查询')
const queryList = shallowRef<QueryList>({})
const config = [
  { name: 'input', prop: 'testInput', attr: { type: 'text' }, on: { change: onSearch } },
  { name: 'select', prop: 'testSelect', attr: { optionV2 } },
  { name: 'date', prop: 'testDate3', attr: { type: 'datetimerange', shortcuts: true } },
  { name: 'date', prop: 'testDate', attr: { shortcuts: true } },
  { name: 'date', prop: 'testDate2', attr: { type: 'daterange', shortcuts: true } },
  { name: 'date', prop: 'testDate5', attr: { type: 'monthrange', shortcuts: true } },
  { name: 'date', prop: 'testDate4', attr: { type: 'datetime', shortcuts: true } },
  { name: 'treeSelect', prop: 'treeSelect' },
  { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: onSearch } }
]
watch(queryList, (value) => console.log('queryList', value))
</script>
