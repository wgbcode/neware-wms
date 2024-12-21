<template>
  <div class="c-flex-column">
    <c-search v-model:data="queryList" :config="searchConfig" style="justify-content: flex-end" />
    <c-table v-loading="tableLoading" :data="newTableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1"> </c-table>
    <BtnDialog ref="btnDialog" type="add" @update="(data:PermBtn[]) => (tableData = data)" />
  </div>
</template>

<script setup lang="tsx">
import { shallowRef, type PropType, computed } from 'vue'
import BtnDialog from './BtnDialog.vue'
import { getAuthBtn, type PermBtn, type Modules } from '@/hooks/useSysBaseData'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DeleteBtn } from '@/views/moduleManager/request'

const props = defineProps({
  selectedRow: {
    type: Object as PropType<Modules>
  }
})

const queryList = shallowRef<QueryList>({})
const searchConfig = [
  { name: 'button', text: '新增', attr: { type: 'primary', iconName: 'btn-add' }, on: { click: addAuthBtn } },
  { name: 'button', text: '编辑', attr: { type: 'primary', iconName: 'btn-edit' }, on: { click: updateAuthBtn } },
  { name: 'button', text: '删除', attr: { type: 'primary', iconName: 'btn-delete' }, on: { click: removeAuthBtn } }
]
const btnDialog = shallowRef()
const selectedData = shallowRef<PermBtn[]>([])
function addAuthBtn() {
  const moduleId = props.selectedRow?.id
  if (moduleId) {
    btnDialog.value?.openDialog({ type: 'add', row: { moduleId } })
  } else {
    ElMessage({ type: 'warning', message: '请选择模块' })
  }
}
function updateAuthBtn() {
  const length = selectedData.value.length
  const message = length === 0 ? '请选择要编辑的权限按钮' : length > 1 ? '只能选择一个权限按钮' : ''
  if (message) {
    ElMessage({ type: 'warning', message })
  } else {
    btnDialog.value?.openDialog({ type: 'update', row: selectedData.value[0] })
  }
}
function removeAuthBtn() {
  const lenght = selectedData.value.length
  if (lenght > 0) {
    ElMessageBox.confirm(`确定删除选中的权限按钮?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const params = selectedData.value.map((i) => i.id)
      DeleteBtn(params).then(async (res) => {
        if (res.code === 200) {
          tableData.value = await getAuthBtn(true)
          ElMessage({ type: 'success', message: '操作成功' })
        }
      })
    })
  } else {
    ElMessage({ type: 'warning', message: '请选择需要删除的权限按钮' })
  }
}

const tableData = shallowRef<PermBtn[]>([])
const handleSelectChange = (data: PermBtn[]) => (selectedData.value = data)
const tableConfig = {
  height: '100%',
  'row-key': 'id',
  stripe: false,
  selectRowOnClick: true,
  on: { 'selection-change': handleSelectChange }
}
const columnsConfig = [
  { type: 'selection', fixed: true },
  { label: '权限按钮 ID', prop: 'domId', width: '180' },
  { label: '权限按钮名称', prop: 'name' }
]
const newTableData = computed(() => {
  const id = props.selectedRow?.id
  return tableData.value.filter((i) => !id || i.moduleId === id)
})

const tableLoading = shallowRef(false)
initData()
async function initData() {
  tableLoading.value = true
  tableData.value = await getAuthBtn()
  tableLoading.value = false
}
</script>
