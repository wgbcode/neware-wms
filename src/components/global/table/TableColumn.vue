<template>
    <el-table-column v-bind="config">
        <template v-if="!config.child && config.slotName" #default="scope">
            <span v-if="config.slotName === 'index'">{{ scope.$index + 1 }}</span>
            <span v-else-if="config.slotName === 'number'">
                {{ numberFormat2({ oldNum: scope.row[config.prop], ...config.format }) }}
            </span>
            <span v-else-if="config.slotName === 'price'">
                {{ numberFormat2({ oldNum: scope.row[config.prop], ...config.format }) }}
            </span>
            <span v-else-if="config.slotName === 'date'">
                {{ dateformat(scope.row[config.prop], config.format) }}
            </span>
            <span v-else-if="config.slotName === 'hasArrow'"
                :class="config.format === 'between' ? 'c-flex-between' : 'c-flex-ycenter'">
                <Icon name="arrow" color="#F8B500" size="12" class="c-mr2 c-mb1" v-on="config.on" />
                <span>{{ scope.row[config.prop] }}</span>
            </span>
            <div v-else-if="config.slotName === 'input'">
                <el-input-number v-if="config.attr.type === 'number'" v-model="scope.row[config.prop]" v-bind="config.attr"
                    v-on="config.on" />
                <el-input v-else v-model="scope.row[config.prop]" v-bind="config.attr" v-on="config.on" />
            </div>
            <div v-else-if="config.slotName === 'select'">
                <el-select-v2 v-model="scope.row[config.prop]" v-bind="config.attr" v-on="config.on" />
            </div>
            <div v-else-if="config.slotName === 'treeSelect'">
                <el-tree-select v-model="scope.row[config.prop]" v-bind="config.attr" v-on="config.on" />
            </div>
            <div v-else-if="config.slotName === 'datePicker'">
                <el-date-picker v-model="scope.row[config.prop]" v-bind="config.attr" v-on="config.on" />
            </div>
            <slot v-else :name="config.slotName" v-bind="scope.row"></slot>
        </template>
        <template v-if="config.child">
            <TableColumn v-for="(item, index) in  config.child " :key="index" :config="item">
                <!-- 插槽向下传递 -->
                <template v-for="(_, name) in   $slots " v-slot:[name]="row: Record<string, any>">
                    <slot :name=" name " v-bind=" row " />
                </template>
            </TableColumn>
        </template>
    </el-table-column>
</template>

<script setup lang="ts">
import { numberFormat2, dateformat } from '@/utils/format'

defineProps({
    config: {
        type: Object,
        required: true
    }
})
</script>

