<template>
  <div class="c-mb6">
    <div class="filter-item-input" :class="{ 'is-has-data-input': allKey.length > 0 }" @click="openDialog"
      @mouseenter="isShowClose = true" @mouseleave="isShowClose = false">
      <Icon class="c-cursor-p c-mr4" name="btn-search-filter" color="#5D5D5D" size="14" @click.stop="clearFilter" />
      <span class="input-text" :class="{ 'is-has-data': allKey.length > 0 }">筛选器</span>
      <span v-if="allKey.length > 0" :class="{ 'is-has-data': allKey.length > 0 }">{{ allKey.length }}条</span>
      <Icon v-if="isShowClose" class="c-cursor-p c-ml4" name="btn-search-filter-clear" color="#5D5D5D" size="14"
        @click.stop="clearFilter" />
    </div>
    <el-dialog v-model="dialogVisible" title="筛选器配置" width="700" :append-to-body="true" draggable>
      <c-table v-model:data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1"
        dialogVisible>
        <template #value="{ row }">
          <component v-if="row.key" :is="matchMap[getConfig(row.key)?.name ?? '']" v-model="modelValue[row.key]"
            v-bind="getConfig(row.key)?.attr ?? {}" :filter="getConfig(row.key)?.filter" />
        </template>
        <template #operate="{ row }">
          <Icon class="c-cursor-p c-mt4" name="btn-search-filter-delete" color="#EA344D" size="13"
            @click="deleteRow(row.key)" />
        </template>
      </c-table>
      <template #footer>
        <div class="c-flex-center">
          <el-button class="left-footer" type="warning" size="small">
            <Icon size="14" name="btn-add" @click="addRow" />
          </el-button>
          <el-button @click="closeDialog" size="small" style="margin-right: 50px">取 消</el-button>
          <el-button type="warning" @click="confirm" size="small" :loading="btnLoading">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<!-- 使用该筛选器，初始化时要传默认值 -->
<script setup lang="tsx">
import { type PropType, useAttrs, shallowRef, computed, onMounted } from 'vue'
import { type Config, matchMap } from './index.vue'
import { ElMessage } from 'element-plus'
import router from '@/router'

interface RowData {
  key: string
  sign: string
  logic: string
  value?: any
}

const props = defineProps({
  filterConfig: {
    type: Object as PropType<Config>,
    required: true
  }
})

onMounted(() => {
  // 挂载时恢复缓存数据
  updateDataByCache(true)
})

// 修改 attrs.filterData 时，会自动更新传入的数据，类似于 defineModel
const attrs = useAttrs() as { filterData: AnyObject; filterName?: string }

const modelValue = computed(() => attrs.filterData) // 动态更新
const dialogVisible = shallowRef(false)
const btnLoading = shallowRef(false)
const isShowClose = shallowRef(false)

// 默认 cacheLocalName 为 filter_search_路由名
// 但当一个路由中拥有多个筛选器时，可添加 filterName 属性，从而避免命名冲突
const rawCacheLocalName = attrs.filterName ?? (router.currentRoute.value.name as string)
const cacheLocalName = 'filter_search_' + rawCacheLocalName.replace(/[A-Z]/g, (match) => '_' + match.toLowerCase())

const emptyData = { key: '', sign: '1', logic: '0' }
const tableData = shallowRef<RowData[]>([{ ...emptyData }])
const allKey = computed(() => tableData.value.map((i) => i.key).filter(Boolean))
const keyOptions = computed(() => {
  return props.filterConfig.flatMap((i) => {
    const name = i.attr?.placeholder || i.attr?.title || i.attr?.filterName
    const isDisabled = i.prop && allKey.value.includes(i.prop)
    return i.filter ? { label: name, value: i.prop, disabled: isDisabled } : []
  })
})
const signList = [
  { label: '等于', value: '0' },
  { label: '包含', value: '1' },
  { label: '大于', value: '10' },
  { label: '大于等于', value: '11' },
  { label: '小于', value: '20' },
  { label: '小于等于', value: '21' }
]
const logicList = [
  { label: '与', value: '0' },
  { label: '或', value: '1' }
]
const tableConfig = { height: '100%', width: '100%', 'highlight-current-row': false }
const columnsConfig = computed(() => {
  return [
    { label: '#', type: 'index', width: 25, align: 'left' },
    { label: '类型', prop: 'key', width: 200, slotName: 'select', slotAttr: { options: keyOptions.value } },
    { label: '运算符', prop: 'sign', width: 100, slotName: 'select', slotAttr: { options: signList, disabled: true } },
    { label: '值', prop: 'value', slotName: 'value', width: 200 },
    { label: '与/或', prop: 'logic', width: 100, slotName: 'select', slotAttr: { options: logicList, disabled: true } },
    { label: '操作', prop: 'operate', slotName: 'operate', width: 35 }
  ]
})

// 手动打开和关闭筛选器
function openDialog() {
  updateDataByCache(false)
  dialogVisible.value = true
}
function updateDataByCache(needUpdateAttrs: boolean) {
  const localDataStr = localStorage.getItem(cacheLocalName)
  if (localDataStr) {
    needUpdateAttrs && JSON.parse(localDataStr).forEach((i: RowData) => (attrs.filterData[i.key] = i.value))
    tableData.value = JSON.parse(localDataStr)
  }
}
function closeDialog() {
  const localDataStr = localStorage.getItem(cacheLocalName)
  if (localDataStr) {
    // 更新根级组件数据(修改 attrs)
    JSON.parse(localDataStr).forEach((i: RowData) => (attrs.filterData[i.key] = i.value))
    tableData.value = JSON.parse(localDataStr)
    dialogVisible.value = false
  } else {
    clearFilter()
  }
}
function clearFilter() {
  updateQueryList(allKey.value) // 更新根级组件数据(修改 attrs)
  tableData.value = [{ ...emptyData }]
  localStorage.removeItem(cacheLocalName)
  dialogVisible.value = false
}
function updateQueryList(keys: string[]) {
  // 配置默认置空值
  const emptyMap: AnyObject = {
    input: '',
    treeSelect: '',
    date: '',
    select: '',
    textPicker: [],
    selectPicker: [],
    datePicker: []
  }
  keys.forEach((key) => {
    attrs.filterData[key] = emptyMap[getMatchName(key)]
  })
}
function getMatchName(key: string) {
  const item = getConfig(key)
  let name = item?.name ?? ''
  const attr = item?.attr ?? {}
  if (name === 'select' && attr.multiple) {
    name = 'selectPicker' // 多选
  }
  if (name === 'date' && attr.type.includes('picker')) {
    name = 'datePicker' // 时间范围选择
  }
  return name
}

// 缓存配置信息，并自动更新传入的数据
function confirm() {
  const localTableData = JSON.stringify(tableData.value.map((i) => ({ ...i, value: attrs.filterData[i.key] })))
  localStorage.setItem(cacheLocalName, localTableData)
  dialogVisible.value = false
  ElMessage({ type: 'success', message: '配置成功' })
}
function getConfig(key: string) {
  return props.filterConfig.find((i) => i.prop === key)
}

// 新增行和删除行
function addRow() {
  const filterLength = props.filterConfig.filter((i) => i.filter).length
  if (tableData.value.length === filterLength) {
    ElMessage({ type: 'warning', message: `当前筛选器配置不能超过${filterLength}条` })
  } else {
    tableData.value = [...tableData.value, { ...emptyData }]
  }
}
function deleteRow(key: string) {
  if (tableData.value.length === 1) {
    tableData.value = [{ ...emptyData }]
  } else {
    tableData.value = tableData.value.filter((i) => i.key !== key)
  }
  updateQueryList([key]) // 更新根级组件数据(修改 attrs)
}
</script>

<style lang="scss" scoped>
.filter-item-input {
  display: flex;
  align-items: center;
  position: relative;
  line-height: normal;
  margin-right: 6px;
  padding-left: 4px;
  width: 80px;
  height: 20px;
  border-radius: 2px;
  border: 1px solid var(--tc-input-border);
  background-color: var(--tc-input-background);
  cursor: pointer;

  .filter-image {
    margin-right: 2px;
    width: 12px;
    height: 12px;
  }

  .filter-close-item {
    font-size: 14px;
    color: var(--tc-primary-text);
    position: absolute;
    right: 4px;
    top: 2px;

    &:hover {
      color: var(--tc-global-yellow);
    }
  }

  &:hover {
    color: var(--tc-global-yellow) !important;
    border: 1px solid var(--tc-global-yellow);
  }

  &.is-has-data-input {
    width: 100px;
    color: var(--tc-global-yellow);
  }

  .input-text {
    white-space: nowrap;
  }

  .is-has-data {
    color: var(--tc-global-yellow) !important;
  }
}

.el-table {
  :deep(.cell) {
    height: 20px;

    .el-select {
      height: 20px;
    }
  }
}

.left-footer {
  position: absolute;
  left: 15px;
}
</style>
