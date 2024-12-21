<template>
  <div class="footWrapper">
    <div class="totalCount">
      共<span>&nbsp;{{ numberFormat(options.baseOption.totalCount, true) }}&nbsp;</span>条
    </div>
    <div class="c-flex-ycenter">
      <div v-for="(item, index) in newCompOption" :key="index">
        <component v-if="item.show" :is="matchMap[item.name]" v-model:data="data" :option="item" @update="updateHandler" />
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import DatePicker from './DatePicker.vue'
import Pagination from './Pagination.vue'
import CheckBox, { type CheckBoxOption } from './CheckBox.vue'
import DropdownBtn, { type DropdownBtnOption } from './DropdownBtn.vue'
import FilterBtns, { type FilterBtnsOption } from './FilterBtns.vue'
import CommonBtn, { type CommonOption } from './CommonBtn.vue'
import TotalAmt, { type TotalAmtOption } from './TotalAmt.vue'
import { type PropType, type Component, computed } from 'vue'
import { numberFormat } from '@/utils/format.js'

const matchMap: Record<string, Component> = {
  datePicker: DatePicker, // 时间选择器
  pagination: Pagination, // 分页器组件
  totalAmt: TotalAmt, // 列总和自动计算
  commonBtn: CommonBtn, // 普通按钮
  dropdownBtn: DropdownBtn, // 下拉按钮
  filterBtns: FilterBtns, // 筛选按钮组
  checkBox: CheckBox // 复选框
}
export interface BaseOption {
  totalCount: number // 总行数
  isSelectAll?: boolean // 是否全选
  selectData?: AnyObject[] // 选中行数据
}
export interface CompOption extends Partial<BaseOption> {
  name: string // 组件名
  show?: boolean // 是否展示
  totalAmtOption?: TotalAmtOption
  commonOption?: CommonOption
  filterBtnsOption?: FilterBtnsOption[]
  dropdownBtnOption?: DropdownBtnOption
  checkBoxOption?: CheckBoxOption
}
const props = defineProps({
  options: {
    type: Object as PropType<FooterOptions>,
    required: true
  }
})
const data = defineModel<FooterData>('data', { required: true })
const newCompOption = computed<CompOption[]>(() => {
  const { baseOption, compOption } = props.options
  return compOption.map((i) => ({ ...i, ...baseOption, show: i.show ?? true }))
})
const emit = defineEmits<{ update: [params: FooterUpdateEvent] }>()
const updateHandler = (event: FooterUpdateEvent) => emit('update', event)
</script>

<style lang="scss" scoped>
.footWrapper {
  display: flex;
  align-items: center;
  margin-left: 10px;
  height: 18px;
  margin-top: 10px;
  .totalCount span {
    color: var(--tc-highlight-text);
  }
}
</style>
