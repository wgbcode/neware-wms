<template>
    <div>
        <CommonSearch :data="queryList" :config="config" />
        <CommonTable :data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1">
        </CommonTable>
    </div>
</template>
  
<script setup lang="tsx">
import { reactive, watch } from 'vue'
import Icon from '@/components/global/Icon.vue'
// virTable
const tableConfig = {
    type: 'virTable',
}
const tableData = Array.from({ length: 1000 }).map((_, idx) => ({
    parentId: null,
    number: idx * 10,
    number2: idx * 20
}))
const columnsConfig = [
    {
        dataKey: 'number',
        title: 'number',
        width: 150
    },
    {
        dataKey: 'number2',
        title: 'number2',
        width: 150,
        cellRenderer: ({ cellData: name }: Record<string, number>) => (
            <div class="c-flex-ycenter">
                <Icon name="test" color="red" />
                <span>{name}</span>
            </div>
        )
    }
]
watch(tableData, (value) => console.log('val', value))

// Search
const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const options = Array.from({ length: 1000 }).map((_, idx) => ({
    value: `Option${idx + 1}`,
    label: `${initials[idx % 10]}${idx} `
}))
const queryList = reactive({
    curPage: 1,
    pageSize: 100
})
const onSearch = () => {
    console.log('查询参数', queryList)
}
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
        prop: 'testDate',
        attr: {
            shortcuts: true
        }
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
  