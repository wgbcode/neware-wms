<template>
    <div>
        <component :is="Table" :data="data" v-bind="newTableConfig" v-on="newTableConfig.on"
            :columnsConfig="newColumnsConfig">
            <!-- 插槽向下传递 -->
            <template v-for="(_, name) in $slots" #[name]="row">
                <slot :name="name" v-bind="row" />
            </template>
        </component>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import Table from './Table.vue'
import { addColumnsDefaultConfig, addTableDefaultConfig } from './addDefaultConfig'
import { getCurInstanceName } from '@/utils/common'
// import VirTable from './VirTualizedTable.vue'

type TableConfig = {
    height?: string,
    width?: string,
    on?: Record<string, Function>  // 批量绑定事件
}

export type ColumnsConfig = {
    type?: string,
    prop?: string,
    label?: string,
    width?: string,
    child?: ColumnsConfig,  // 多级表头
    'show-overflow-tooltip'?: boolean, // 禁止多行，悬浮时 tooltip 提示
    slotName: string, // 插槽命名
}[]

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

console.log(111, getCurInstanceName())
// const matchMap = {
//     table: Table,
//     virTable: VirTable
// }

</script>

<style scoped></style>