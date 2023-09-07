<template>
    <el-table v-bind="tableConfig" v-on="tableConfig.on">
        <template v-for="(item, index) in columnsConfig" :key="index">
            <TableColumn :config="item">
                <!-- 插槽向下传递 -->
                <template v-for="(_, name) in $slots" #[name]="row">
                    <slot :name="name" v-bind="row" />
                </template>
            </TableColumn>
        </template>
    </el-table>
</template>

<script setup lang="ts">
import TableColumn from './TableColumn.vue'
defineProps({
    tableConfig: {
        type: Object,
        required: true
    },
    columnsConfig: {
        type: Object,
        required: true
    }
})
</script>