<template>
  <div class="c-flex-column">
    <c-search v-model:data="queryList" :config="searchConfig" style="justify-content: flex-end" />
    <c-table :data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1"> </c-table>
  </div>
</template>

<script setup lang="tsx">
import { ElMessage } from 'element-plus'
import { shallowRef } from 'vue'
const queryList = shallowRef<QueryList>({})
const searchConfig = [
  { name: 'button', text: '新增', attr: { type: 'primary', iconName: 'btn-add' }, on: { click: addAuthData } },
  { name: 'button', text: '编辑', attr: { type: 'primary', iconName: 'btn-edit' }, on: { click: updateAuthData } },
  { name: 'button', text: '删除', attr: { type: 'primary', iconName: 'btn-delete' }, on: { click: removeAuthData } }
]
function addAuthData() {
  ElMessage({ type: 'warning', message: '功能开发中...' })
}
function updateAuthData() {
  ElMessage({ type: 'warning', message: '功能开发中...' })
}
function removeAuthData() {
  ElMessage({ type: 'warning', message: '功能开发中...' })
}

const tableData = shallowRef([])
const tableConfig = { height: '100%', 'row-key': 'id', stripe: false }
const columnsConfig = [
  { type: 'selection', fixed: true },
  { label: '权限数据 ID', prop: 'name', width: '180' },
  { label: '权限数据名称', prop: 'code' }
]
</script>
