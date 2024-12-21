<template>
  <el-table-column v-bind="config">
    <!-- 自定义表头 -->
    <template v-if="config.headerSlotName || config.required" #header="scope">
      <div v-if="config.headerSlotName === 'tooltip'" class="c-flex-ycenter">
        <span>{{ scope.column.label }}</span>
        <el-tooltip class="box-item" effect="dark" :content="config.headerSlotParams.content" placement="top">
          <Icon name="question" color="var(--tc-common-40)" class="c-ml6" />
        </el-tooltip>
      </div>
      <div v-if="config.required"><i class="c-mr3" style="color: red">*</i>{{ scope.column.label }}</div>
      <slot v-else :name="config.headerSlotName" v-bind="config.headerSlotAttr" v-on="config.headerSlotOn" :column="scope.column" />
    </template>
    <!-- 自定义列模板 -->
    <template v-if="!config.child && config.slotName" #default="scope">
      <span v-if="config.slotName === 'index'">{{ scope.$index + 1 }}</span>
      <!-- 出纳页面进/出账金额单元格 -->
      <span v-else-if="config.slotName === 'inOutPrice'">
        <span :style="{ color: toColor(scope.row) }">
          {{ toFormatInOutPrice(scope.row) }}
        </span>
      </span>
      <!-- 单选和多选分别通过 current-change 和 selection-change 事件获取被选择数据  -->
      <input v-else-if="config.slotName === 'radio'" class="table-radio" type="radio" name="table-radio" />
      <!-- 文字、数字、价格、日期、时间格式化 -->
      <span v-else-if="['text', 'number', 'price', 'date', 'datetime'].includes(config.slotName)">
        {{
          config.slotParams.prefix +
          formatValue(config.slotName, {
            value: scope.row[config.prop],
            ...config.slotParams.format
          })
        }}
      </span>
      <!-- 添加箭头 -->
      <span v-else-if="config.slotName === 'addArrow'" :class="getArrowClass(config.slotParams.layout)">
        <!-- 在箭头前加图标 -->
        <div v-if="config.slotParams.beforeIcons" class="c-flex-ycenter c-mr4">
          <template v-for="(item, index) in config.slotParams.beforeIcons">
            <Icon
              v-if="showArrowIcon(item, scope, config)"
              :name="item.name"
              :color="item.color"
              :key="index"
              :size="item?.size ?? '12'"
              :class="item?.class"
              :style="item?.style"
            />
          </template>
        </div>
        <!-- 箭头 -->
        <Icon
          v-if="scope.row[config.prop]"
          style="min-width: 12px; cursor: pointer"
          name="arrow"
          color="var(--tc-brand)"
          size="12"
          class="c-mr2 c-mb1"
          @click.stop="() => config?.slotOn?.click({ row: scope.row, column: config })"
        />
        <!-- 文字 -->
        <span class="c-tooltip" :style="arrowTextStyle(scope, config)">
          {{
            [null, undefined].includes(scope.row[config.prop])
              ? ''
              : config.slotParams.prefix +
                formatValue(config.slotParams.type, {
                  value: scope.row[config.prop],
                  ...config.slotParams.format
                })
          }}
        </span>
        <!-- 在文字后加图标 -->
        <div v-if="config.slotParams.afterIcons" class="c-flex-ycenter c-ml2">
          <template v-for="(item, index) in config.slotParams.afterIcons">
            <Icon
              v-if="showArrowIcon(item, scope, config)"
              :name="item.name"
              :color="item.color"
              :key="index"
              :size="item?.size ?? '12'"
              :class="item?.class"
              :style="item?.style"
            />
          </template>
        </div>
      </span>
      <!-- input 输入框（含数字模式） -->
      <div v-else-if="config.slotName === 'input'">
        <el-input-number
          v-if="config.slotParams.type === 'number'"
          v-model="newData[scope.$index][config.prop]"
          v-bind="config.slotAttr"
          v-on="config.slotOn"
        />
        <el-input v-else v-model="newData[scope.$index][config.prop]" v-bind="config.slotAttr" v-on="config.slotOn" />
      </div>
      <!-- 下拉框 -->
      <div v-else-if="config.slotName === 'select'">
        <el-select-v2 v-model="newData[scope.$index][config.prop]" v-bind="config.slotAttr" v-on="config.slotOn" />
      </div>
      <!-- 树形选择框 -->
      <div v-else-if="config.slotName === 'treeSelect'">
        <el-tree-select v-model="newData[scope.$index][config.prop]" v-bind="config.slotAttr" v-on="config.slotOn" />
      </div>
      <!-- 日期/时间选择器 -->
      <div v-else-if="config.slotName === 'datePicker'">
        <el-date-picker v-model="newData[scope.$index][config.prop]" v-bind="config.slotAttr" v-on="config.slotOn" />
      </div>

      <!-- 自定义插槽。不可修改 v-bind / row / row2 -->
      <slot v-else :name="config.slotName" :index="scope.$index" v-bind="scope.row" :row="newData[scope.$index]" :row2="data[scope.$index]" />
    </template>

    <!-- 多级表头（组件递归） -->
    <template v-if="config.child">
      <TableColumn
        v-for="(item, index) in config.child"
        :key="index"
        :config="item"
        :data="data"
        @update:data="(data) => emit('update:data', data)"
        :tableConfig="tableConfig"
      >
        <!-- 插槽向下传递 -->
        <template v-for="(_, name) in $slots" v-slot:[name]="row: AnyObject">
          <slot :name="name" v-bind="row" />
        </template>
      </TableColumn>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import useVModel from '@/hooks/useVModel'
import { numberFormat2, dateFormat2, type NumberFormat2, type DateFormat2 } from '@/utils/format'
import type { RowData } from '@/views/finance/bankStatements/types'

const props = defineProps({
  data: {
    type: Array<AnyObject>,
    required: true
  },
  config: {
    type: Object,
    required: true
  },
  tableConfig: {
    type: Object,
    required: true
  }
})
// 格式化进/出账金额单元格
const toFormatInOutPrice = (row: RowData) => {
  let price = row.inAmount ? row.inAmount : row.outAmount
  let priceAbsFormValue = numberFormat2({
    value: price,
    isInteger: false,
    min: 2,
    max: 2
  } as NumberFormat2)
  return row.inAmount ? priceAbsFormValue : `(${priceAbsFormValue})`
}
// 动态改变进/出账金额单元格文本颜色
function toColor(row: RowData) {
  if (row.outAmount) {
    return 'var(--tc-status-finish)'
  }
  return 'var(--tc-primary-text)' // 默认颜色
}

const getArrowClass = (key: string) => {
  const map: Record<string, string> = {
    between: 'c-flex-between',
    flexEnd: 'c-flex-xend'
  }
  return map[key] ?? 'c-flex-ycenter'
}

const showArrowIcon = (item: AnyObject, scope: AnyObject, config: AnyObject) => {
  // item.show 可能是布尔值，也可能是函数
  return typeof item.show === 'boolean' ? item.show : item.show({ row: scope.row, column: config })
}

const arrowTextStyle = (scope: AnyObject, config: AnyObject) => {
  // textStyle 可能不存在，可能是一个普通对象，也可能是一个函数
  const textStyle = config.slotParams?.textStyle ?? {}
  if (typeof textStyle === 'function') {
    return textStyle({ row: scope.row, column: config })
  }
  return textStyle
}

function formatValue(type: string, params: AnyObject) {
  let value
  switch (type) {
    case 'text':
      value = (params as AnyObject).value
      break
    case 'number':
    case 'price':
      value = numberFormat2(params as NumberFormat2)
      value = params?.emptyText && Number(value) === 0 ? params.emptyText : value
      break
    case 'date':
    case 'datetime':
      value = dateFormat2(params as DateFormat2)
      break
  }
  return value
}

// 数据改变时，通知根组件修改数据
const emit = defineEmits(['update:data'])
const newData = props.tableConfig.isChildSlot ? props.data : (useVModel(props, 'data', emit) as any)
</script>
