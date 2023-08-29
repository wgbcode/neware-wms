<template>
    <div v-for="item in newConfigData " :key="item.name">
        <component :is="matchMap[item.name]" v-model="queryParams![item.prop!]" v-bind="item.attr" :style="item.style" />
    </div>
</template>

<script setup lang="ts">
import Button from './Button.vue'
import Input from './Input.vue'
import Select from './Select.vue'
import DatePicker from './DatePicker.vue'
import DateTimePicker from './DateTimePicker.vue'
import { type PropType, type Component } from 'vue'

type ConfigData = {
    name: string,
    prop?: string | null,
    attr?: Record<string, any>,
    style?: Record<string, any>
}[]
const props = defineProps({
    queryParams: Object,
    configData: {
        type: Object as PropType<ConfigData>,
        required: true
    }
})
const matchMap: Record<string, Component> = {
    button: Button,
    input: Input,
    select: Select,
    datePicker: DatePicker,
    dateTimePicker: DateTimePicker
}
const newConfigData = props.configData.map(item => {
    switch (item.name) {
        case 'input':
            item.attr ||= {}
            item.attr.placeholder ||= '请输入'
            item.style ||= {}
            item.style.width ||= '200px'
            break
        case 'select':
            item.attr ||= {}
            item.attr.placeholder ||= '请选择'
            item.attr.multiple ||= true
            item.attr.filterable ||= true
            item.style ||= {}
            item.style.width ||= '300px'
            break
    }
    return item
})
</script>

<style scoped lang="scss"></style>