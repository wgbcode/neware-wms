<template>
    <el-table>
        <template v-for="(item, index) in columnsConfig" :key="index">
            <TableColumn :config="item" />
        </template>
    </el-table>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { ColumnsConfig } from './index.vue'
import TableColumn from './TableColumn.vue'
defineProps({
    columnsConfig: Object as PropType<ColumnsConfig>
})

</script>