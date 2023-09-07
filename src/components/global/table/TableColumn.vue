<template>
    <el-table-column v-bind="config">
        <template v-if="config.headerSlotName" #header="scope">
            <div v-if="config.headerSlotName === 'tooltip'" class="c-flex-ycenter">
                <span>{{ scope.column.label }}</span>
                <el-tooltip class="box-item" effect="dark" :content="config.headerSlotParams.content" placement="top">
                    <Icon name="question" color="var(--tc-common-40)" class="c-ml6" />
                </el-tooltip>
            </div>
            <slot v-else :name="config.headerSlotName" v-bind="config.headerSlotAttr" v-on="config.headerSlotOn"></slot>
        </template>
        <template v-if="!config.child && config.slotName" #default="scope">
            <span v-if="config.slotName === 'index'">{{ scope.$index + 1 }}</span>
            <span v-else-if="['number', 'price', 'date', 'datetime'].includes(config.slotName)">
                {{ formatValue(config.slotName, { value: scope.row[config.prop], ...config.slotParams.format }) }}
            </span>
            <span v-else-if="config.slotName === 'addArrow'"
                :class="config.slotParams.layout === 'between' ? 'c-flex-between' : 'c-flex-ycenter'">
                <Icon name="arrow" color="var(--tc-brand)" size="12" class="c-mr2 c-mb1" v-on="config.slotOn" />
                {{ formatValue(config.slotParams.type, { value: scope.row[config.prop], ...config.slotParams.format }) }}
            </span>
            <div v-else-if="config.slotName === 'input'">
                <el-input-number v-if="config.slotParams.type === 'number'" v-model="scope.row[config.prop]"
                    v-bind="config.slotAttr" v-on="config.slotOn" />
                <el-input v-else v-model="scope.row[config.prop]" v-bind="config.slotAttr" v-on="config.slotOn" />
            </div>
            <div v-else-if="config.slotName === 'select'">
                <el-select-v2 v-model="scope.row[config.prop]" v-bind="config.slotAttr" v-on="config.slotOn" />
            </div>
            <div v-else-if="config.slotName === 'treeSelect'">
                <el-tree-select v-model="scope.row[config.prop]" v-bind="config.slotAttr" v-on="config.slotOn" />
            </div>
            <div v-else-if="config.slotName === 'datePicker'">
                <el-date-picker v-model="scope.row[config.prop]" v-bind="config.slotAttr" v-on="config.slotOn" />
            </div>
            <slot v-else :name="config.slotName" v-bind="scope.row"></slot>
        </template>
        <template v-if="config.child">
            <TableColumn v-for="(item, index) in config.child" :key="index" :config="item">
                <!-- 插槽向下传递 -->
                <!-- toDo：row 添加类型判断时，保存时 v-for 自动添加空格问题 -->
                <template v-for="(_, name) in $slots" v-slot:[name]="row">
                    <slot :name="name" v-bind="row" />
                </template>
            </TableColumn>
        </template>
    </el-table-column>
</template>

<script setup lang="ts">
import { numberFormat2, dateFormat2, type NumberFormat2, type DateFormat2 } from '@/utils/format'

defineProps({
    config: {
        type: Object,
        required: true
    }
})

function formatValue(type: string, params: unknown) {
    let value
    switch (type) {
        case 'number':
        case 'price':
            value = numberFormat2(params as NumberFormat2)
            break
        case 'date':
        case 'datetime':
            value = dateFormat2(params as DateFormat2)
            break
    }
    return value
}
</script>

