<template>
  <div>
    <CommonSearch :config="config" :queryList="queryList" />
    <CommonTable :data="tableData" :columnsConfig="columnsConfig" :tableConfig="tableConfig"
      class="c-flex-1 c-overflow-auto">
      <template #date="row">
        <div>{{ row.date }}</div>
      </template>
      <template #name="row">
        <div>{{ row.name }}</div>
      </template>
      <template #address="row">
        <!-- {{ console.log('slotProps111', row) }} -->
        <div>{{ row.address }}</div>
      </template>
    </CommonTable>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
// Table
interface User {
  date: string
  name: string
  address: string
}


const tableData = reactive([
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  }

])
const tableConfig = reactive({
  height: '100%',
  width: '100%',
  "row-class-name": tableRowClassName,
  "default-sort": { prop: 'date', order: 'descending' },
  on: {
    "current-change": handleCurrentChange
  }
})
const columnsConfig = reactive([
  { type: 'selection' },
  { label: '#', slotName: 'index' },
  { prop: 'date', slotName: 'hasArrow', label: 'Date', width: '200', sortable: true, on: { click: clickArrow } },
  {
    label: 'test', child: [
      { prop: 'name', slotName: 'treeSelect', label: 'Name' },
      {
        label: 'address1', child: [
          { label: 'address', slotName: 'address', prop: 'address', width: '200' },
          { label: 'address2' }
        ]
      }
    ]
  },
  {
    label: 'test5', slotName: 'datePicker', prop: 'test5'
  },
  {
    label: 'test6', slotName: 'datePicker', prop: 'test6', attr: { type: 'datetime' }
  },
  {
    label: 'test2', slotName: 'input', prop: 'test2', attr: { type: 'number', min: 0, max: 1000000 }, on: { change: handleChange }
  },
  {
    label: 'test3', slotName: 'select', prop: 'test3'
  },
  {
    label: 'test4', slotName: 'input', prop: 'test4'
  }
])
function tableRowClassName({ rowIndex }: Record<string, number>) {
  if (rowIndex === 1) {
    return 'warning-row'
  } else if (rowIndex === 3) {
    return 'success-row'
  }
  return ''
}
const currentRow = ref()
function handleCurrentChange(val: User | undefined) {
  currentRow.value = val
  console.log('val', val)
}
function handleChange(value: number) {
  console.log('value', value)
}
function clickArrow() {
  console.log('我被点击了')

}
// watch(tableData, (value) => console.log('val', value))

// Search
const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const options = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `Option${idx + 1}`,
  label: `${initials[idx % 10]}${idx}`,
}))
const onSearch = () => {
  console.log('查询')
}
const config = reactive([
  {
    name: 'input',
    prop: 'testInput',
    attr: {
      type: 'text',
    },
    on: {
      keyup: onSearch
    }
  },
  {
    name: 'select',
    prop: 'testSelect',
    attr: {
      options
    }
  },
  {
    name: 'date',
    prop: 'testDate3',
    attr: {
      type: 'datetimerange',
      shortcuts: true
    }
  },
  {
    name: 'date',
    prop: 'testDate',
    attr: {
      shortcuts: true
    }
  },
  {
    name: 'date',
    prop: 'testDate2',
    attr: {
      type: 'daterange',
      shortcuts: true
    }
  },
  {
    name: 'date',
    prop: 'testDate5',
    attr: {
      type: 'monthrange',
      shortcuts: true
    }
  },
  {
    name: 'date',
    prop: 'testDate4',
    attr: {
      type: 'datetime',
      shortcuts: true
    }
  },
  {
    name: 'treeSelect'
  },
  {
    name: 'button',
    text: '查询',
    attr: {
      type: 'primary'
    },
    on: {
      click: onSearch
    }
  },
])
const queryList = reactive({})
watch(queryList, (value) => console.log('val', value))

</script>

<style scoped lang="scss">
:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
  --el-fill-color-lighter: var(--el-color-warning-light-9);
}

:deep(.el-table .success-row) {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
  --el-fill-color-lighter: var(--el-color-success-light-9);
}
</style>
