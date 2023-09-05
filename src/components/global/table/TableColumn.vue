<template>
    <el-table-column v-bind="config">
        <template v-if="!config.child && config.slotName" #default="scope">
            <slot :name="config.slotName" v-bind="scope.row"></slot>
        </template>
        <template v-if="config.child">
            <TableColumn v-for="(item, index) in   config.child  " :key="index" :config="item">
                <!-- 插槽向下传递 -->
                <template v-for="(_, name) in   $slots  " v-slot:[name]="row: Record<string, any>">
                    <slot :name=" name " v-bind=" row " />
                </template>
            </TableColumn>
        </template>
    </el-table-column>
</template>

<script setup lang="ts">
defineProps({
    config: {
        type: Object,
        required: true
    }
})
</script>

