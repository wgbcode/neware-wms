<template>
    <div>
        <component :is="Table" :data="data" v-bind="newTableConfig" v-on="newTableConfig.on"
            :columnsConfig="newColumnsConfig" />
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import Table from './Table.vue'
import { addColumnsDefaultConfig, addTableDefaultConfig } from './addDefaultConfig'
// import VirTable from './VirTualizedTable.vue'

export type ColumnsConfig = {
    type?: string,
    prop?: string,
    label?: string,
    width?: string,
    child?: ColumnsConfig,  // 多级表头
    'show-overflow-tooltip'?: boolean, // 禁止多行，悬浮时 tooltip 提示
}[]

type TableConfig = {
    height?: string,
    width?: string,
    on?: Record<string, Function>  // 批量绑定事件
}

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    columnsConfig: {
        type: Object as PropType<ColumnsConfig>,
        required: true
    },
    tableConfig: Object as PropType<TableConfig>
})
const newTableConfig = addTableDefaultConfig(props.tableConfig)
const newColumnsConfig = addColumnsDefaultConfig(props.columnsConfig)


// const matchMap = {
//     table: Table,
//     virTable: VirTable
// }

</script>

<style scoped></style>