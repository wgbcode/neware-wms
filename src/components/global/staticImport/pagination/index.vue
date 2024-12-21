<template>
  <el-pagination
    v-model:current-page="newData.page"
    v-model:page-size="newData.pageSize"
    :total="newData.total"
    @current-change="emitParentEvent"
    @size-change="emitParentEvent"
    :page-sizes="pageSizeArr"
    :pager-count="pagerCount"
    layout="total, sizes, prev, pager, next, jumper, slot"
  >
    <!-- 日期选择器 -->
    <el-date-picker
      v-if="isShowDatePicker"
      v-model="newData.createTime"
      @change="handleDatetimeChange"
      size="small"
      type="daterange"
      range-separator="-"
      start-placeholder="开始日期"
      end-placeholder="截止日期"
      value-format="YYYY.MM.DD"
      format="YYYY.MM.DD"
      :shortcuts="shortcuts('daterange')"
    />
    <!-- 列金额总计 -->
    <ul v-if="totalAmtOption" class="totalAmt">
      <li>
        <label class="label">当前条数: </label>
        <span class="value">{{ totalOption.length }} 条</span>
      </li>
      <li v-for="(item, index) in totalOption.data" :key="index">
        <label class="label">{{ item.label + ': ' }}</label>
        <span class="value">{{ numberFormat(item.value) }}</span>
      </li>
    </ul>
    <!-- 分页器组件内容插槽 -->
    <slot name="content"></slot>
  </el-pagination>
</template>

<script setup lang="ts">
import useVModel from '@/hooks/useVModel'
import { type PropType, computed, type Ref, type ShallowRef } from 'vue'
import { shortcuts } from '@/components/global/staticImport/search/addDefaultConfig'
import { numberFormat } from '@/utils/format'

interface TotalAmtOption {
  totalMap: AnyObject<string>[]
  selectData: Ref<AnyObject[]> | ShallowRef<AnyObject[]>
}
interface TotalOption {
  length: number
  data: {
    label: string
    value: string
  }[]
}

const props = defineProps({
  data: {
    type: Object as PropType<PaginationData>,
    required: true
  },
  pageSizeArr: {
    type: Object
  },
  change: {
    type: Function
  },
  isShowDatePicker: {
    type: Boolean,
    default: false
  },
  totalAmtOption: {
    type: Object as PropType<TotalAmtOption>
  },
  pagerCount: {
    type: Number,
    default: 5
  }
})

const pageSizeArr = computed(() => props.pageSizeArr || [35, 200, props.data.total])
const totalOption = computed(() => {
  let result = { length: 0, data: [] } as TotalOption
  if (props.totalAmtOption) {
    const { totalMap, selectData } = props.totalAmtOption
    const newSelectData = selectData.value ?? []
    const keys = totalMap.map((i) => i.key)
    const obj = newSelectData.reduce((a, b) => {
      keys.forEach((key) => {
        a[key] || (a[key] = 0)
        a[key] += b[key] ?? 0
      })
      return a
    }, {})
    result.length = newSelectData.length
    result.data = totalMap.map((i) => ({ label: i.label, value: obj[i.key] }))
  }
  return result
})

// 子组件数据改变时，通知父组件修改数据
const emit = defineEmits(['update:data', 'change', 'datetimeChange'])
const newData = useVModel(props, 'data', emit)
// 日期选择
function handleDatetimeChange(...args: any[]) {
  emit('datetimeChange', args)
}
// 触发父组件自定义事件
const emitParentEvent = () => emit('change')
</script>

<style scoped lang="scss">
:deep(.el-date-editor) {
  margin-left: 24px;
  height: 20px;
  width: 200px;
  max-width: 200px;
  line-height: 20px;
  border-radius: 0;
  background-color: var(--tc-input-background);
  input {
    font-size: 12px;
    color: var(--tc-primary-text);
  }
  span {
    color: var(--tc-label-text);
  }
}
.totalAmt {
  display: flex;
  align-items: center;
  li {
    margin-left: 12px;
    font-size: 12px;
    .label {
      font-weight: 700;
      color: var(--tc-primary-text);
    }
    .value {
      color: var(--tc-highlight-text);
    }
  }
}
</style>
