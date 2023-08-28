<template>
    <div v-for="item in  props.configData " :key="item.name">
        <component :is="matchMap[item.name]"
            :queryParams="props.queryParams && item.prop ? props.queryParams[item.prop] : ''" />
    </div>
</template>

<script setup lang="ts">
import Button from './Button.vue'
import Input from './Input.vue'
import Select from './Select.vue'
import DatePicker from './DatePicker.vue'
import DateTimePicker from './DateTimePicker.vue'
import { type PropType, type Component } from 'vue'

interface ConfigData {
    name: string,
    prop?: string,
    attr?: Object
}
const props = defineProps({
    queryParams: Object,
    configData: {
        type: Object as PropType<ConfigData[]>,
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
</script>

<style scoped lang="scss"></style>