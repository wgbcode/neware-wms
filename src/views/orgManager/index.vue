<template>
  <div class="c-flex-column c-h100p">
    <div style="height: 26px">
      <c-search v-model:data="queryList" :config="searchConfig" />
    </div>
    <div class="c-flex c-flex-1 c-overflow-hidden">
      <section class="c-w110 c-pl5 c-w130 content-wrapper">
        <h3>所有公司>></h3>
        <el-radio-group v-model="selectedGorps">
          <el-radio v-for="item in corpList" :key="item.corpName" :value="item.corpName">{{ item.corpName }}</el-radio>
        </el-radio-group>
      </section>
      <section class="c-overflow-auto c-w250 content-wrapper">
        <h3>所有部门>></h3>
        <el-tree-v2
          style="max-width: 240px"
          :data="newSubOrgTreeList1"
          :height="800"
          :props="{ value: 'id', label: 'name', children: 'children' }"
          show-checkbox
          :default-checked-keys="defaultSelectedSubOrgs"
          :default-expanded-keys="defaultExpandedSubOrgs"
          @check="checkChangeHandler"
        />
      </section>
      <section class="c-flex-1">
        <c-table :data="newSubOrgTreeList2" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-h100p">
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
      </section>
    </div>
    <AssignUserDialog ref="assignUserDialog" v-model:assignLoading="assignLoading" />
    <UpadteOrgDialog ref="upadteOrgDialog" :corpList="corpList" :subOrgList="subOrgTreeList" @update="loadSubOrgList" />
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { GetCorp, DeleteOrg } from './request'
import type { GorpList } from './types'
import { getSubOrgs, orgsArrayToTree, type SubOrgList } from '@/hooks/useSysBaseData'
import { requestSuccessAsync } from '@/utils/requestSuccess'
import UpadteOrgDialog from './components/UpadteOrgDialog.vue'
import AssignUserDialog from './components/AssignUserDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const corpList = shallowRef<GorpList[]>([]) // 公司
const subOrgList = shallowRef<SubOrgList[]>([]) // 部门
const selectedGorps = shallowRef<string>('新威尔')
const defaultSelectedSubOrgs = shallowRef<string[]>([])
const currentSelectedSubOrgs = shallowRef<string[]>([])
const defaultExpandedSubOrgs = shallowRef<string[]>(['eb5d38df-14e2-4a46-98ec-9fd5da19f4e4'])
const selectedTableData = shallowRef<SubOrgList[]>([])
const selectChangeHandler = (data: SubOrgList[]) => (selectedTableData.value = data)

const tableConfig = { height: '100%', 'row-key': 'id', stripe: false, 'default-expand-all': true, on: { 'selection-change': selectChangeHandler } }
const columnsConfig = [
  { type: 'selection' },
  { label: '名称', prop: 'name', width: '200' },
  { label: '部门主管', prop: 'userName', width: '100', slotName: 'userName' },
  { label: '上级部门', prop: 'parentName', width: '200' },
  { label: '状态', prop: 'status', width: '60', slotName: 'status' },
  { label: '操作', prop: 'oprate', width: '120', slotName: 'oprate' }
]

const subOrgTreeList = computed(() => {
  const tree = orgsArrayToTree(subOrgList.value)
  tree.unshift({ id: 'root', name: '根节点' } as SubOrgList)
  return tree
})
const newSubOrgTreeList1 = computed(() => {
  return selectedGorps.value === '新威尔' ? orgsArrayToTree(subOrgList.value) : []
})
const newSubOrgTreeList2 = computed(() => {
  const newSubOrgList = subOrgList.value.filter((i) => currentSelectedSubOrgs.value.includes(i.id))
  return selectedGorps.value === '新威尔' ? orgsArrayToTree(newSubOrgList) : []
})
function checkChangeHandler(data: SubOrgList, info: { checkedKeys: string[] }) {
  currentSelectedSubOrgs.value = info.checkedKeys
  addParentId(data)
}
function addParentId(data: SubOrgList) {
  if (data.parentId) {
    currentSelectedSubOrgs.value.push(data.parentId)
    const item = subOrgList.value.find((i) => i.id === data.parentId)
    item && addParentId(item)
  }
}

const queryList = shallowRef<QueryList>({})
const assignLoading = shallowRef<boolean>(false)
const searchConfig = computed(() => {
  return [
    { name: 'button', text: '新增', attr: { type: 'primary', iconName: 'btn-add' }, on: { click: addOrg } },
    { name: 'button', text: '编辑', attr: { type: 'primary', iconName: 'btn-edit' }, on: { click: editOrg } },
    { name: 'button', text: '删除', attr: { type: 'primary', iconName: 'btn-delete' }, on: { click: deleteOrg } },
    {
      name: 'button',
      text: '为部门分配用户',
      attr: { type: 'primary', iconName: 'btn-assign-user', loading: assignLoading.value },
      on: { click: assignUserForOrg }
    }
  ]
})
const upadteOrgDialog = shallowRef()
const assignUserDialog = shallowRef()
function addOrg() {
  upadteOrgDialog.value?.openDialog('add')
}
function editOrg() {
  const data = selectedTableData.value
  if (data.length !== 0) {
    data.length > 1
      ? ElMessage({ type: 'warning', message: '每次只能选择一行数据' })
      : upadteOrgDialog.value?.openDialog('update', selectedTableData.value[0])
  } else {
    ElMessage({ type: 'warning', message: '请选择需要编辑的部门' })
  }
}
function deleteOrg() {
  const data = selectedTableData.value
  if (data.length !== 0) {
    ElMessageBox.confirm(`确定删除已选择的部门吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const params = data.map((i) => i.id)
      DeleteOrg(params).then(async (res) => {
        if (res.code === 200) {
          await loadSubOrgList()
          ElMessage({ type: 'success', message: '操作成功' })
        }
      })
    })
  } else {
    ElMessage({ type: 'warning', message: '请选择需要删除的部门' })
  }
}
function assignUserForOrg() {
  const data = selectedTableData.value
  if (data.length !== 0) {
    if (data.length > 1) {
      ElMessage({ type: 'warning', message: '每次只能选择一行数据' })
    } else {
      assignLoading.value = true
      assignUserDialog.value?.openDialog(selectedTableData.value[0])
    }
  } else {
    ElMessage({ type: 'warning', message: '请选择需要分配用户的部门' })
  }
}
async function loadSubOrgList() {
  subOrgList.value = await getSubOrgs(true)
  defaultSelectedSubOrgs.value = currentSelectedSubOrgs.value = subOrgList.value.map((i) => i.id)
}

// 初始化数据
initData()
async function initData() {
  loadSubOrgList()
  await requestSuccessAsync({ api: GetCorp, ref: corpList })
  corpList.value = corpList.value.map((i) => ({ ...i, value: i.id, label: i.corpName }))
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
</style>
