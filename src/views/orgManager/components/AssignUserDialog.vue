<template>
  <el-dialog v-model="dialogVisible" title="为部门分配用户" width="800" :append-to-body="true" draggable>
    <div class="c-flex-column">
      <div class="c-flex-between">
        <c-search v-model:data="queryList" :config="searchConfig" />
        <div class="c-flex-ycenter c-fs12 c-mr5">
          <label v-show="cacheSelectedData.length > 0" style="color: var(--tc-label-text)">已选中用户：</label>
          <p class="c-tooltip" style="max-width: 300px" :title="cacheSelectedData.map((i) => i.name).join(',')">
            {{ cacheSelectedData.map((i) => i.name).join(',') }}
          </p>
        </div>
      </div>
      <c-table ref="table" v-loading="tableLoading" :data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig">
        <template #status="scope">
          <span class="c-tooltip" :style="{ color: scope?.status === 0 ? 'var(--tc-global-green)' : 'var(--tc-global-red)' }">
            {{ scope?.status === 0 ? '正常' : '停用' }}
          </span>
        </template>
      </c-table>
      <c-pagination v-if="tableData.length > 0" v-model:data="pagiData" @change="onSearch" />
    </div>
    <template #footer>
      <div class="c-flex-center">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="warning" @click="assignUserForOrg" :loading="btnLoading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { shallowRef, ref, nextTick } from 'vue'
import type { UserData } from '@/views/userManager/types'
import { type SubOrgList } from '@/hooks/useSysBaseData'
import { LoadUsersByOrg, AssignOrgUsers } from '@/views/orgManager/request'
import { LoadUsers } from '@/views/userManager/request'
import { requestSuccessAsync } from '@/utils/requestSuccess'
import { ElMessage } from 'element-plus'

let orgId = '' // 部门 id
const dialogVisible = shallowRef(false)
const btnLoading = shallowRef(false)
const tableData = shallowRef<UserData[]>([])
const cacheSelectedData = ref<UserData[]>([]) // 缓存被选中的用户
const pagiData = shallowRef({ page: 1, pageSize: 15, total: 500 })
const queryList = shallowRef<QueryList>({ key: '' })
const tableLoading = shallowRef(false)

const searchConfig = [
  { name: 'input', prop: 'key', attr: { type: 'text' }, on: { change: onSearch } },
  { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: onSearch } }
]

const tableConfig = { height: '300px', stripe: false, selectRowOnClick: false, on: { select: selectHandler, 'select-all': selectAllHandler } }
const columnsConfig = [
  { type: 'selection' },
  { label: '账号', prop: 'account', width: '150' },
  { label: '姓名', prop: 'name', width: '150' },
  { label: '所属部门', prop: 'organizations', width: '350' },
  { label: '状态', prop: 'status', width: '95', slotName: 'status' }
]
function selectHandler(selection: UserData[], row: UserData) {
  const isChecked = selection.some((i) => i.id === row.id) // 判断是选中还是取消选中
  updaeCacheSelect(row, isChecked)
}
function selectAllHandler(selection: UserData[]) {
  const isChecked = selection.length !== 0 // 判断是选中还是取消选中
  tableData.value.forEach((row) => updaeCacheSelect(row, isChecked))
}
function updaeCacheSelect(row: UserData, isChecked: boolean) {
  if (isChecked) {
    cacheSelectedData.value.map((i) => i.id).includes(row.id) || cacheSelectedData.value.push({ ...row })
  } else {
    cacheSelectedData.value = cacheSelectedData.value.filter((i) => i.id !== row.id)
  }
}

// 为部门分配用户
const assignUserForOrg = () => {
  btnLoading.value = true
  const params = { orgId, userIds: cacheSelectedData.value.map((i) => i.id) }
  AssignOrgUsers(params)
    .then((res) => {
      if (res.code === 200) {
        dialogVisible.value = false
        ElMessage({ type: 'success', message: '操作成功' })
      }
    })
    .finally(() => {
      btnLoading.value = false
    })
}

const emit = defineEmits(['update:assignLoading'])
const openDialog = async (row: SubOrgList) => {
  tableLoading.value = true
  try {
    orgId = row.id // 保存部门 id
    const params = { api: LoadUsersByOrg, ref: cacheSelectedData, params: { orgId, limit: 9999, page: 1 }, key: 'data' }
    await requestSuccessAsync(params)
    await onSearch()
    tableLoading.value = false
    emit('update:assignLoading', false)
  } catch (_error) {
    tableLoading.value = false
    emit('update:assignLoading', false)
  }
}
async function onSearch() {
  const { page, pageSize } = pagiData.value
  const params = { orgId: '', limit: pageSize, page, key: queryList.value.key }
  const res = await LoadUsers(params)
  const { code, count, data } = res
  if (code === 200) {
    pagiData.value.total = count
    tableData.value = data
    autoSelectRow() // 自动选中表格行
  }
}
const table = shallowRef()
async function autoSelectRow() {
  dialogVisible.value = true // 弹窗要先显示，才能获取到表格实例
  await nextTick()
  const instance = table.value?.getInstance()
  cacheSelectedData.value?.forEach((item) => {
    instance.data.forEach((row: UserData) => {
      if (row.id === item.id) {
        instance.toggleRowSelection(row, true)
      }
    })
  })
}

defineExpose({ openDialog })
</script>

<style scoped lang="scss"></style>
