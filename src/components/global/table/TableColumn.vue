<template>
    <el-table-column v-bind="config">
        <template v-if="config && config.child">
            <TableColumn v-for="(item, index) in config.child" :key="index" :config="item" />
        </template>
    </el-table-column>
</template>

<script setup lang="ts">
defineProps({
    config: Object
})
</script>

