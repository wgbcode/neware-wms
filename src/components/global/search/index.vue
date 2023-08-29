<template>
    <div class="c-flex-ycenter c-flex-only-wrap">
        <div v-for="(item, index) in newConfigData " :key="index">
            <component v-if="item.isShow" :is="matchMap[item.name]" v-model="queryParams![item.prop!]" v-bind="item.attr"
                :style="{ ...item.style }" :text="item.text" :on="item.on" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from './Button.vue'
import Input from './Input.vue'
import Select from './Select.vue'
import DatePicker from './DatePicker.vue'
import { type PropType, type Component } from 'vue'

type ConfigData = {
    name: string,
    prop?: string,
    text?: string,
    isShow?: boolean,
    attr?: Record<string, any>,
    style?: Record<string, any>
    on?: Record<string, any>
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
    date: DatePicker
}
const shortcuts = (type: string) => {
    let texts: Array<string> = []
    let values: Array<Date | Date[]> = []
    const caculateTime = (day: number, isArray: boolean) => {
        if (isArray) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * day)
            return [start, end]
        }
        else {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * day)
            return date
        }
    }
    switch (type) {
        case 'date':
        case 'datetime':
            texts = ['今天', '昨天', '一周前']
            values = [new Date(), caculateTime(1, false), caculateTime(7, false)]
            break
        case 'daterange':
        case 'datetimerange':
            texts = ['上周', '上个月', '之前三个月']
            values = [caculateTime(7, true), caculateTime(30, true), caculateTime(90, true)]
            break
    }
    return [
        { text: texts[0], value: values[0] },
        { text: texts[1], value: values[1] },
        { text: texts[2], value: values[2] },
    ]
}
const dateTypeCheck = (style: Record<string, any>, attr: Record<string, any>, type: string) => {
    const resetOption = (isRange: boolean, isTime: boolean) => {
        let holder
        if (isTime) {
            holder = '时间'
            attr.format ??= 'YYYY.MM.DD HH:mm:ss'
        } else {
            holder = '日期'
            attr.format ??= 'YYYY.MM.DD'
        }
        if (isRange) {
            attr['unlink-panels'] ??= false
            attr['range-separator'] ??= '-'
            attr['start-placeholder'] ??= `开始${holder}`
            attr['end-placeholder'] ??= `结束${holder}`
            attr.shortcuts &&= shortcuts(type)
        } else {
            attr.placeholder ??= `请选择${holder}`
            attr.shortcuts &&= shortcuts(type)

        }
    }
    switch (type) {
        case 'date':
            style.width ??= '130px'
            resetOption(false, false)
            break
        case 'daterange':
            style.width ??= '210px'
            resetOption(true, false)
            break
        case 'datetime':
            style.width ??= '180px'
            resetOption(false, true)
            break
        case 'datetimerange':
            style.width ??= '300px'
            resetOption(true, true)
            break
    }
}
const newConfigData = props.configData.map(item => {
    item.isShow ??= true
    const attr = item.attr ??= {}
    const style = item.style ??= { height: '24px', marginRight: '5px', marginBottom: '10px' }
    switch (item.name) {
        case 'button':
            attr.type ??= 'default'
            style.marginLeft ??= '5px'
            break
        case 'input':
            attr.placeholder ??= '请输入'
            style.width ??= '140px'
            break
        case 'select':
            attr.placeholder ??= '请选择'
            attr.multiple ??= false  // 是否支持多选
            attr.filterable ??= true  // 是否支持搜索
            style.width ??= '140px'
            break
        case 'date':
            attr.type ??= 'date'  // type:year/month/date/dates/datetime/week/datetimerange/daterange/monthrange
            attr.size ??= 'default'
            dateTypeCheck(style, attr, attr.type)
            break
    }
    return item
})
</script>