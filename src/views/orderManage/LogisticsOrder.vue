<template>
  <div>
    <CommonSearch :data="queryList" :config="config" />
    <CommonTable :data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig"
      class="c-flex-1 c-overflow-auto">
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
// interface User2 extends User {
//   id: number,
//   children?: User[]
// }

const tableData = reactive([
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    number: 1
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    number: 2
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  }
])
// const newTableData = tableData.map((item, index) => {
//   const obj: User2 = { id: index, ...item }
//   if (index === 1) {
//     obj.children = []
//     obj.children.push(item)
//   }
//   return obj
// })

const tableConfig = {
  height: '100%',
  width: '100%',
  'row-key': 'id',
  'show-summary': true,
  isCustomFooter: true,
  footerMethod: footMethod,
  'row-class-name': tableRowClassName,
  'default-sort': { prop: 'date', order: 'descending' },
  on: {
    'current-change': handleCurrentChange
  }
}
const columnsConfig = [
  { type: 'expand' },
  { type: 'selection' },
  { slotName: 'index' },
  {
    prop: 'date',
    label: 'Date',
    width: '200',
    sortable: true,
    slotName: 'addArrow',
    slotParams: { type: 'date' },
    slotOn: { click: clickArrow }
  },
  {
    label: 'test',
    child: [
      { prop: 'name', label: 'Name', slotName: 'treeSelect' },
      {
        label: 'address1',
        child: [
          { label: 'address', prop: 'address', width: '200', slotName: 'address', headerSlotName: 'tooltip', headerSlotParams: { content: 'Top Center prompts info' }, },
          { label: 'number', prop: 'number', slotName: 'number' }
        ]
      }
    ]
  },
  {
    label: 'test5',
    prop: 'test5',
    slotName: 'datePicker',
  },
  {
    label: 'test6',
    prop: 'test6',
    slotName: 'datePicker',
    slotAttr: { type: 'datetime' },
    headerSlotName: 'tooltip',
    headerSlotParams: { content: 'Top Center prompts info' },
  },
  {
    label: 'test2',
    prop: 'test2',
    slotName: 'input',
    slotParams: { type: 'number', min: 0, max: 1000000 },
    slotOn: { change: handleChange }
  },
  {
    label: 'test3',
    prop: 'test3',
    slotName: 'select'
  },
  {
    label: 'test4',
    prop: 'test4',
    slotName: 'input'
  }
]
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
// watch(tableData, (value) => console.log('val', value))

// Search
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
  {
    name: 'input',
    prop: 'testInput',
    attr: {
      type: 'text'
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
  }
]
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
