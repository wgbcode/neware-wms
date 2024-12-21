<template>
  <div class="c-flex-column">
    <c-search v-model:data="queryList" :config="config" />
    <c-table v-loading="tableLoading" v-model:data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1">
      <template #identity="{ row }">
        <div>{{ formatIdentity(row.identity) }}</div>
      </template>
      <template #list="{ row }">
        <div v-if="Array.isArray(row.list)">
          <el-tag v-for="item in row.list" :key="item.name" size="small" type="primary" class="c-my1 c-mr2">{{ item.name }}</el-tag>
        </div>
        <el-tag v-else size="small" round type="primary">loading...</el-tag>
      </template>
      <template #status="{ row }">
        <div :style="{ color: row.status === 0 ? 'var(--tc-status-finish)' : 'var(--tc-status-error)' }">
          {{ row.status === 0 ? '正常' : '停用' }}
        </div>
      </template>
      <template #oprate>
        <div class="c-flex-ycenter">
          <el-button type="success" style="height: 16px">编辑</el-button>
          <el-button type="danger" style="height: 16px">删除</el-button>
        </div>
      </template>
    </c-table>
    <c-pagination v-if="tableData.length > 0" v-model:data="pagData" @change="getRolesTableData" />
    <UpdateRoleDialog ref="updateRoleDialog" @getRolesTableData="getRolesTableData" />
    <AssignPemissionDialog ref="assignPemissionDialog" />
  </div>
</template>

<script setup lang="tsx">
import { shallowRef } from 'vue'
import type { RowData } from '@/views/roleManager/types'
import { GetRolesTableData, LoadByRole } from '@/views/roleManager/request'
import { ElTag, ElButton } from 'element-plus'
import UpdateRoleDialog from './components/UpdateRoleDialog.vue'
import AssignPemissionDialog from './components/AssignPemissionDialog.vue'
import { useChangeRole } from './hooks/useChangeRole'
import { useAssignPemission } from './hooks/useAssignPemission'

const selectedRow = shallowRef<RowData>()
const requestMap = new Map()
const updateRoleDialog = shallowRef<{ openDialog: Function } | null>(null)
const assignPemissionDialog = shallowRef<{ openDialog: Function } | null>(null)
const queryList = shallowRef<QueryList>({ key: '' })

// 初始化业务逻辑
export type HookParams = typeof hookParams
const hookParams = { selectedRow, getRolesTableData, requestMap, updateRoleDialog, assignPemissionDialog, queryList }
const { openChangeRuleDialog, removeRule } = useChangeRole(hookParams)
const { openAssignDialog } = useAssignPemission(hookParams)

const config = [
  { name: 'input', prop: 'key', attr: { type: 'text' }, on: { change: getRolesTableData } },
  { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: getRolesTableData } },
  { name: 'button', text: '新增', attr: { type: 'primary', iconName: 'btn-add' }, on: { click: () => openChangeRuleDialog('add') } },
  { name: 'button', text: '编辑', attr: { type: 'primary', iconName: 'btn-edit' }, on: { click: () => openChangeRuleDialog('update') } },
  { name: 'button', text: '删除', attr: { type: 'primary', iconName: 'btn-delete' }, on: { click: removeRule } },
  {
    name: 'button',
    text: '为角色分配权限',
    attr: { type: 'primary', title: '菜单权限 / 按钮权限 / 数据权限', iconName: 'btn-assign-auth' },
    on: { click: openAssignDialog }
  }
]

const tableData = shallowRef<RowData[]>([])
const selectRowHandler = (row: RowData) => (selectedRow.value = row)
const tableConfig = { height: '100%', width: '100%', on: { 'current-change': selectRowHandler } }
const tableLoading = shallowRef(false)
const columnsConfig = [
  { slotName: 'radio' },
  { slotName: 'index' },
  { prop: 'name', label: '角色名称', width: 130 },
  { prop: 'roleKey', label: '角色标识', width: 170 },
  { prop: 'identity', label: '身份标识', width: 80, slotName: 'identity' },
  { prop: 'list', label: '用户列表', width: 930, slotName: 'list' },
  { prop: 'status', label: '状态', width: 50, slotName: 'status' },
  { prop: 'oprate', label: '操作', width: 100, slotName: 'oprate' }
]
function formatIdentity(cellData: string) {
  const map: Record<string, string> = { 1: '销售员', 2: '技术员', 3: '工程', 4: '研发' }
  return map[cellData] || ''
}

// 考虑到性能因素，每次默认只加载 10 条数据
const pagData = shallowRef({ page: 1, pageSize: 10, total: 199 })

// 获取角色表格数据
getRolesTableData()
function getRolesTableData(key?: string) {
  tableLoading.value = true
  const { page, pageSize } = pagData.value
  key && (queryList.value.key = key)
  GetRolesTableData({ page, limit: pageSize, key: queryList.value.key.trim() })
    .then((res) => {
      const { code, result } = res
      if (code === 200) {
        // TODO:后端分页参数无效，暂时前端处理；total 字段也未返回
        let data = result
        if (result && result.length > pageSize) {
          const start = (page - 1) * pageSize
          const end = start + pageSize
          data = result.slice(start, end)
        }
        tableData.value = data
        // 获取并更新表格 list 字段
        tableData.value.forEach((i) => updateTableList(i.id))
      }
    })
    .finally(() => (tableLoading.value = false))
}

// 获取表格 list 字段数据，并缓存响应数据
function updateTableList(id: string) {
  const obj = requestMap.get(id)
  const needRequest = !obj || (obj && !obj.isRequest && obj.code !== 200)
  const hasData = obj && obj.code === 200 && obj.data
  needRequest && loadByRole(id)
  hasData && setTableList(id, obj.data)
}
function loadByRole(id: string) {
  let resCode = 0
  let resData: string[] | null = null
  let tryCount = 1
  requestMap.set(id, { isRequest: true, code: resCode, data: resData })
  LoadByRole({ page: 1, limit: 9999, roleId: id })
    .then((res) => {
      const { code, data } = res
      resCode = code
      resData = code === 200 ? data : null
      setTableList(id, data)
    })
    .catch(() => {
      // 失败后再尝试加载 1 次
      if (tryCount === 1) {
        loadByRole(id)
        tryCount++
      }
    })
    .finally(() => {
      requestMap.set(id, { isRequest: false, code: resCode, data: resData })
    })
}
function setTableList(id: string, list: string[] | null) {
  if (list) {
    tableData.value.forEach((item, index) => {
      if (item.id === id) {
        Reflect.set(tableData.value[index], 'list', list)
        tableData.value = [...tableData.value] // 刷新表格
      }
    })
  }
}
</script>

<style scoped lang="scss">
// 允许表格单元格换行
:deep(td.el-table__cell .cell) {
  height: 100% !important;
  min-height: 20px;
}
:deep(td.el-table__cell .cell > div) {
  max-height: none !important;
  flex-wrap: wrap;
}
</style>
