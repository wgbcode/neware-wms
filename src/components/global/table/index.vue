<template>
    <div>
        <component :is="Table" :data="data" :columnsConfig="newColumnsConfig" :tableConfig="newTableConfig">
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
// import VirTable from './VirTualizedTable.vue'

type TableConfig = {
    height?: string,
    width?: string,
    stripe?: boolean,
    border?: boolean,
    on?: Record<string, Function>  // 批量绑定事件
    isCustomFooter?: boolean, // 是否显示表尾合计行
    footerMethod?: Function, // 自定义合计行累加方法，参数为当前 porp 和当前列数据
}

export type ColumnsConfig = {
    type?: string,
    prop?: string,
    label?: string,
    width?: string,
    align?: string,
    child?: ColumnsConfig,  // 设置多级表头时需配置
    'show-overflow-tooltip'?: boolean, // 禁止多行配置，默认超出悬浮 tooltip 提示
    slotName?: string, // 插槽命名(列)
    slotParams?: Record<string, any>, // 插槽数据传递（列）
    slotAttr?: Record<string, any>, // 批量绑定属性(列)
    slotOn?: Record<string, Function>, // 批量绑定事件(列)
    headerSlotName?: string, // 插槽命名（表头）
    headerSlotParams?: Record<string, any>,  // 插槽数据传递（表头）
    headerSlotAttr?: Record<string, any>, // 批量绑定属性（表头）
    headerSlotOn?: Record<string, Function>, // 批量绑定事件（表头）
}[]

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    tableConfig: Object as PropType<TableConfig>,
    columnsConfig: {
        type: Object as PropType<ColumnsConfig>,
        required: true
    }
})
const newTableConfig = addTableDefaultConfig(props.tableConfig)
const newColumnsConfig = addColumnsDefaultConfig(props.columnsConfig)

// const matchMap = {
//     table: Table,
//     virTable: VirTable
// }

</script>