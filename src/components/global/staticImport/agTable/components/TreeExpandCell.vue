<template>
  <div class="c-flex-ycenter">
    <Icon
      v-if="value"
      :name="expandStatus ? 'btn-detail-show' : 'btn-detail-hidden'"
      color="var(--tc-brand)"
      size="16"
      class="c-mr2 c-mb1 c-cursor-p"
      @click.stop="clickHandler"
    />
    <el-checkbox v-if="checkbox?.show" v-model="checked" label="" size="small" class="c-mr2" />
    <Icon
      v-if="arrow?.show"
      style="min-width: 12px"
      name="arrow"
      color="var(--tc-brand)"
      size="12"
      class="c-mr2 c-mb1 c-cursor-p"
      @click.stop="() => arrow?.click({ row: data })"
    />
    <span class="c-tooltip">
      {{ isEmptyText ? '' : formatTextFn ? formatTextFn(value) : value }}
    </span>
    <LinkUser
      v-if="linkUser?.show && data[linkUser.id]"
      :type="data[linkUser.type]"
      :userId="data[linkUser.id]"
      :text="data[linkUser.text]"
      :isHideText2Arrow="true"
    />
    <CustomerIcons v-if="customerIcons?.show && data[customerIcons.data]" :data="data[customerIcons.data]" />
  </div>
</template>

<script setup lang="tsx">
import { shallowRef } from 'vue'
import type { ICellRendererParams } from 'ag-grid-community'
import CustomerIcons from '@/components/customerIcons/index.vue'

interface RowData {
  [key: string]: any
}

interface Props {
  params: ICellRendererParams
}

const props = defineProps<Props>()
const { value, colDef, data, api } = props.params
const { compOption, extraOption, hasFullWidthRowExpand } = colDef?.context ?? {}
const { formatTextFn, isEmptyText } = compOption ?? {} // 基本配置
const { arrow, checkbox, linkUser, customerIcons } = extraOption ?? {} // 额外配置（如箭头、复选框、LinkUser组件、CustomerIcons组件）
const checked = shallowRef<boolean>(false)
const expandStatus = shallowRef<boolean>(false)
const context = api.getGridOption('context') ?? {}
const { isDefaultExpandTreeData } = context ?? {}
expandStatus.value = typeof data.isExpandTreeData === 'boolean' ? data.isExpandTreeData : (isDefaultExpandTreeData ?? true)
const clickHandler = () => {
  // 在更新表格数据前，拿到当前页面渲染出来的数据
  const renderedNodes = api.getRenderedNodes()
  // 更新表格数据
  updateTableData()
  // TODO: 滚动到点击行(待优化)
  scrollToClickRow(renderedNodes)
}
function scrollToClickRow(renderedNodes: RowData[]) {
  // 判断是否是跨网格行组件
  if (hasFullWidthRowExpand) {
    api.ensureIndexVisible(data.id)
  } else {
    const endCount = renderedNodes.length - renderedNodes.findIndex((i) => i.id == data.id) - 12
    api.ensureIndexVisible(data.id + endCount)
  }
}
function updateTableData() {
  const curTreeData = api.getGridOption('rowData') ?? []
  if (expandStatus.value) {
    removeRowData(curTreeData) // 删除当前行树形数组
  } else {
    addRowData(curTreeData) // 插入当前行树形数组
  }
  api.setGridOption('rowData', addId2Index(curTreeData)) // 更新表格数据
}
function removeRowData(curTreeData: RowData[]) {
  let totalLength: number = 0
  const getLength = (item: RowData) => {
    totalLength += 1
    const { children } = item
    const { isExpandTreeData } = curTreeData[data.id + totalLength]
    if (children?.length > 0 && isExpandTreeData) {
      children.forEach((_item: RowData) => getLength(_item))
    }
  }
  data.children.forEach((item: RowData) => getLength(item))
  curTreeData.splice(data.id + 1, totalLength)
}

function addRowData(curTreeData: RowData[]) {
  let curIndex: number = data.id
  const add = (item: RowData) => {
    curIndex++
    const { children } = item
    if (children?.length > 0) {
      curTreeData.splice(curIndex, 0, { ...item, isExpandTreeData: true })
      children.forEach((_item: RowData) => add(_item))
    } else {
      curTreeData.splice(curIndex, 0, item)
    }
  }
  data.children.forEach((item: RowData) => add(item))
}
function addId2Index(curTreeData: RowData[]) {
  return curTreeData.map((item, index) => {
    if (data.id === index) {
      return { ...item, id: index, index, isExpandTreeData: !expandStatus.value }
    }
    return { ...item, id: index, index }
  })
}
</script>

<style scoped lang="scss"></style>
