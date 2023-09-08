<template>
    <!-- 父元素高度需固定 -->
    <el-auto-resizer>
        <template #default="{ height, width }">
            <el-table-v2 :data="data" v-bind="tableConfig" :columns="columnsConfig" :width="width" :height="height" />
        </template>
    </el-auto-resizer>
</template>

<script setup lang="ts">
defineProps({
    data: Array,
    tableConfig: Object,
    columnsConfig: Object
})
</script>