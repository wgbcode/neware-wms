<template>
  <div class="c-flex-column c-h100p">
    <div style="height: 26px">
      <c-search v-model:data="queryList" :config="searchConfig" />
    </div>
    <div class="c-flex c-flex-1 c-overflow-hidden">
      <section class="c-w250 content-wrapper c-flex-column">
        <h3 class="all-org c-cursor-p" @click="onSearch">所有部门>></h3>
        <div class="c-overflow-auto">
          <el-tree
            ref="tree"
            style="max-width: 240px"
            :data="newSubOrgTreeList"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            default-expand-all
            :highlight-current="isHighlightNode"
            @node-click="nodeClickHandler"
          />
        </div>
      </section>
      <section class="c-flex-column c-flex-1">
        <c-table v-loading="tableLoading" :data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-h100p">
          <template #userName="scope">
            <span class="c-tooltip">{{ Array.isArray(scope?.userName) ? scope.userName.join(',') : '' }}</span>
          </template>
          <template #status="scope">
            <span class="c-tooltip" :style="{ color: scope?.status === 0 ? 'var(--tc-global-green)' : 'var(--tc-global-red)' }">
              {{ scope?.status === 0 ? '正常' : '停用' }}
            </span>
          </template>
          <template #oprate>
            <el-button class="c-h18" type="primary">编辑</el-button>
            <el-button class="c-h18" type="danger">停用</el-button>
          </template>
        </c-table>
        <c-pagination v-if="tableData.length > 0" v-model:data="pagiData" @change="onSearch" />
      </section>
    </div>
    <UpdateUserDialog
      ref="updateUserDialog"
      :subOrgTreeList="newSubOrgTreeList"
      :categoryNameList="categoryNameList"
      :categoryDtCodeList="categoryDtCodeList"
      @update="onSearch"
    />
    <AssignRoleDialog ref="assignRoleDialog" />
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef, ref } from 'vue'
import { LoadUsers, GetCategoryNameList, GetCategoryDtCodeList, DeleteUser } from './request'
import type { UserData } from './types'
import { getSubOrgs, orgsArrayToTree, type SubOrgList } from '@/hooks/useSysBaseData'
import { ElMessage, ElMessageBox } from 'element-plus'
import UpdateUserDialog from './components/UpdateUserDialog.vue'
import { requestList } from '@/utils/requestList'
import AssignRoleDialog from './components/AssignRoleDialog.vue'

const tableData = shallowRef<UserData[]>([])
const subOrgList = shallowRef<SubOrgList[]>([]) // 部门
const defaultSelectedSubOrgs = shallowRef<string[]>([])
const currentSelectedSubOrgs = shallowRef<string[]>([])
const selectedTableData = shallowRef<UserData[]>([])
const pagiData = ref({ page: 1, pageSize: 200, total: 500 })
const tableLoading = shallowRef(false)
const isHighlightNode = shallowRef(false)

const selectChangeHandler = (data: UserData[]) => (selectedTableData.value = data)
const tableConfig = { height: '100%', stripe: false, on: { 'selection-change': selectChangeHandler } }
const columnsConfig = [
  { type: 'selection' },
  { label: '账号', prop: 'account', width: '150' },
  { label: '姓名', prop: 'name', width: '100' },
  { label: '标识', prop: 'indicateNames', width: '180' },
  { label: '钉钉账号', prop: 'ddUserId', width: '150' },
  { label: '钉钉姓名', prop: 'ddUserName', width: '80' },
  { label: '所属部门', prop: 'organizations', width: '180' },
  { label: '状态', prop: 'status', width: '50', slotName: 'status' },
  { label: '操作', prop: 'oprate', width: '120', slotName: 'oprate' }
]

const newSubOrgTreeList = computed(() => orgsArrayToTree(subOrgList.value, false))

const queryList = shallowRef<QueryList>({ key: '' })
const searchConfig = computed(() => {
  return [
    { name: 'input', prop: 'key', attr: { type: 'text' }, on: { change: onSearch } },
    { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: onSearch } },
    { name: 'button', text: '新增', attr: { type: 'primary', iconName: 'btn-add' }, on: { click: addUser } },
    { name: 'button', text: '编辑', attr: { type: 'primary', iconName: 'btn-edit' }, on: { click: editUser } },
    { name: 'button', text: '删除', attr: { type: 'primary', iconName: 'btn-delete' }, on: { click: deleteUser } },
    { name: 'button', text: '为用户分配角色', attr: { type: 'primary', iconName: 'btn-assign-user' }, on: { click: assignUserForOrg } }
  ]
})

const updateUserDialog = shallowRef()
const categoryNameList = shallowRef([]) // 劳务关系下拉列表
const categoryDtCodeList = shallowRef([]) // 标识下拉列表
function addUser() {
  getCategoryList()
  updateUserDialog.value?.openDialog('add')
}
function editUser() {
  getCategoryList()
  const data = selectedTableData.value
  if (data.length !== 0) {
    data.length > 1
      ? ElMessage({ type: 'warning', message: '每次只能选择一行数据' })
      : updateUserDialog.value?.openDialog('update', selectedTableData.value[0])
  } else {
    ElMessage({ type: 'warning', message: '请选择需要编辑的用户' })
  }
}
// 获取下拉列表数据
function getCategoryList() {
  categoryNameList.value.length === 0 && requestList(GetCategoryNameList, categoryNameList)
  categoryDtCodeList.value.length === 0 && requestList(GetCategoryDtCodeList, categoryDtCodeList)
}
function deleteUser() {
  const data = selectedTableData.value
  if (data.length !== 0) {
    ElMessageBox.confirm(`确定删除已选择的用户吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const params = data.map((i) => i.id)
      DeleteUser(params).then(async (res) => {
        if (res.code === 200) {
          await onSearch()
          ElMessage({ type: 'success', message: '操作成功' })
        }
      })
    })
  } else {
    ElMessage({ type: 'warning', message: '请选择需要删除的用户' })
  }
}
const assignRoleDialog = shallowRef()
function assignUserForOrg() {
  const data = selectedTableData.value
  if (data.length !== 0) {
    if (data.length > 1) {
      ElMessage({ type: 'warning', message: '每次只能选择一行数据' })
    } else {
      assignRoleDialog.value?.openDialog(selectedTableData.value[0].id)
    }
  } else {
    ElMessage({ type: 'warning', message: '请选择需要分配角色的用户' })
  }
}
let orgId = ''
function nodeClickHandler(data: SubOrgList) {
  orgId = data.id // 临时保存部门 id
  onSearch()
  isHighlightNode.value = true // 允许高亮
}

// 初始化数据
initData()
async function initData() {
  onSearch()
  subOrgList.value = await getSubOrgs(true)
  defaultSelectedSubOrgs.value = currentSelectedSubOrgs.value = subOrgList.value.map((i) => i.id)
}
async function onSearch() {
  try {
    tableLoading.value = true
    const { page, pageSize } = pagiData.value
    isHighlightNode.value = false // 不允许高亮
    const params = { page, limit: pageSize, orgId, key: queryList.value.key }
    const res = await LoadUsers(params)
    const { count, code, data } = res
    if (code === 200) {
      pagiData.value.total = count
      tableData.value = data
    }
    orgId = '' // 清空部门 id
    tableLoading.value = false
  } catch (_error) {
    orgId = '' // 清空部门 id
    tableLoading.value = false
  }
}
</script>

<style scoped lang="scss">
:deep(.cell) {
  display: flex;
  align-items: center;
}
.content-wrapper {
  border: 1px solid var(--tc-dialog-border);
  background-color: var(--tc-content-background);
  padding-left: 10px;
  padding-top: 5px;
  margin-right: 8px;
  h3 {
    padding-left: 5px;
    padding-bottom: 5px;
    font-weight: 700;
    color: var(--tc-label-text);
  }
  :deep(.el-radio__label) {
    font-size: 14px;
  }
}
.all-org:hover {
  color: var(--tc-global-yellow);
}
</style>
