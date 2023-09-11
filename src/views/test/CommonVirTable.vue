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
// toDo：使用 tsx 语法时，无法识别全局组件，需重复引入问题，如 Icon
const tableConfig = {
    type: 'virTable',
}
const tableData = reactive(Array.from({ length: 1000 }).map((_, idx) => ({
    id: 'row-' + idx,
    parentId: null,
    checked: false,
    editing: false,
    number: idx * 10,
    number2: idx * 20,
    inputTest: 111
})))
const columnsConfig = [
    {
        key: 'selection'
    },
    {
        key: 'index'
    },
    {
        key: 'input',
        datakey: 'inputTest',
        title: 'inputTest'
    },
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
                <Icon name="test" color="white" class="c-mr5" />
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
  