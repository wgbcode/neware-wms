<template>
    <div class="c-overflow-auto">
        <component :is="matchMap[curType]" :data="data" :columnsConfig="newColumnsConfig" :tableConfig="newTableConfig">
            <!-- 插槽向下传递 -->
            <template v-for="(_, name) in $slots" #[name]="row">
                <slot :name="name" v-bind="row" />
            </template>
        </component>
    </div>
</template>

<script setup lang="ts">
import type { Component, PropType } from 'vue'
import Table from './Table.vue'
import { addColumnsDefaultConfig, addTableDefaultConfig } from './addDefaultConfig'
import { addVirColumnsDefaultConfig, addVirTableDefaultConfig } from './addVirDefaultConfig'
import VirTable from './VirTable.vue'

export type TableConfig = {
    type?: string,  // 用于判断表格类型，table（默认）/virTable
    // table
    height?: string,
    width?: string,
    stripe?: boolean,
    border?: boolean,
    'table-layout'?: string,
    on?: Record<string, Function>  // 批量绑定事件
    isCustomFooter?: boolean, // 是否显示表尾合计行
    footerMethod?: Function, // 自定义合计行累加方法，参数为当前 porp 和当前列数据
    addPagination?: boolean, // 是否添加分页器
    style?: Record<string, any>,
    'highlight-current-row'?: boolean,
    'show-summary'?: boolean,
    'summary-method'?: Function,
    // virTable
    fixed?: boolean,
}
export type ColumnsConfig = {
    // table
    type?: string,  // 当前列将格式化的类型，selection/expand
    prop?: string,  // 用于和数据的字段名匹配
    label?: string, // 表格列标题
    width?: number | string,
    align?: string,
    child?: ColumnsConfig,  // 设置多级表头时需配置
    'show-overflow-tooltip'?: boolean, // 禁止多行配置，默认超出悬浮 tooltip 提示
    slotName?: string, // 插槽命名(列)，index/number/price/date/datetime/input/select/treeSelect/datePicker/addArrow
    slotParams?: Record<string, any>, // 插槽数据传递（列）
    slotAttr?: Record<string, any>, // 批量绑定属性(列)
    slotOn?: Record<string, Function>, // 批量绑定事件(列)
    headerSlotName?: string, // 插槽命名（表头）
    headerSlotParams?: Record<string, any>,  // 插槽数据传递（表头）
    headerSlotAttr?: Record<string, any>, // 批量绑定属性（表头）
    headerSlotOn?: Record<string, Function>, // 批量绑定事件（表头）
    // virTable
    key?: string,  // 当前列将格式化的类型，selection/index/input
    dataKey?: string, // 用于和数据的字段名匹配
    title?: string, // 表格列标题
    cellRenderer?: Component | Function, // 单元格内容格式化
    headerCellRenderer?: Component | Function, // 表头内容格式化
}[]
const matchMap: Record<string, Component> = {
    table: Table,
    virTable: VirTable
}
const props = defineProps({
    data: {
        type: Array as PropType<Record<string, any>[]>,
        required: true
    },
    tableConfig: Object as PropType<TableConfig>,
    columnsConfig: {
        type: Object as PropType<ColumnsConfig>,
        required: true
    }
})
const curType = props.tableConfig && props.tableConfig.type ? props.tableConfig.type : 'table'
let newTableConfig: TableConfig, newColumnsConfig: ColumnsConfig
switch (curType) {
    case 'table':
        newTableConfig = addTableDefaultConfig(props.tableConfig)
        newColumnsConfig = addColumnsDefaultConfig(props.columnsConfig)
        break
    case 'virTable':
        newTableConfig = addVirTableDefaultConfig(props.tableConfig)
        newColumnsConfig = addVirColumnsDefaultConfig(props.columnsConfig, props.data)
        break
}
</script>