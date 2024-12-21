<template>
  <div class="c-flex-column">
    <c-search v-model:data="queryList" :config="searchConfig" style="justify-content: flex-end" />
    <TreeTable class="c-flex-1" :data="modulesTree" v-loading="tableLoading" v-model:selectedRow="selectedRow" />
    <ModuleDialog ref="moduleDialog" v-model:data="modulesTree" />
  </div>
</template>

<script setup lang="tsx">
import { shallowRef, h, computed, type PropType } from 'vue'
import TreeTable from './TreeTable.vue'
import ModuleDialog from './ModuleDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DeleteModules, LoadForRoleModule } from '@/views/moduleManager/request'
import Icon from '@/components/global/dynamicImport/icon/index.vue'
import { getModulesTree, type Modules } from '@/hooks/useSysBaseData'

const selectedRow = defineModel('selectedRow', { type: Object as PropType<Modules> })

// 搜索栏
const roleBtnLoading = shallowRef<boolean>(false)
const queryList = shallowRef<QueryList>({})
const searchConfig = computed(() => [
  { name: 'button', text: '新增', attr: { type: 'primary', iconName: 'btn-add' }, on: { click: addModule } },
  { name: 'button', text: '编辑', attr: { type: 'primary', iconName: 'btn-edit' }, on: { click: updateModule } },
  { name: 'button', text: '删除', attr: { type: 'primary', iconName: 'btn-delete' }, on: { click: removeModule } },
  {
    name: 'button',
    text: '查看角色权限',
    attr: { type: 'primary', iconName: 'btn-view', loading: roleBtnLoading.value },
    on: { click: viewEnableRoles }
  }
])
const moduleDialog = shallowRef<{ openDialog: Function } | null>(null)
function addModule() {
  moduleDialog.value?.openDialog('add')
}
function updateModule() {
  if (selectedRow.value) {
    moduleDialog.value?.openDialog('update', selectedRow.value)
  } else {
    ElMessage({ type: 'warning', message: '请选择需要编辑的模块' })
  }
}
function removeModule() {
  if (selectedRow.value) {
    ElMessageBox.confirm(`确定删除${selectedRow.value.name}模块?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const params = selectedRow.value ? [selectedRow.value.id] : []
      DeleteModules(params).then(async (res) => {
        if (res.code === 200) {
          modulesTree.value = await getModulesTree(true)
          ElMessage({ type: 'success', message: '操作成功' })
        }
      })
    })
  } else {
    ElMessage({ type: 'warning', message: '请选择需要删除的模块' })
  }
}
function viewEnableRoles() {
  if (selectedRow.value) {
    roleBtnLoading.value = true
    LoadForRoleModule({ moduleId: selectedRow.value.id })
      .then((res) => {
        const { code, result } = res
        if (code === 200) {
          if (result && result.length > 0) {
            const message = h(
              'div',
              { style: { 'max-height': '500px', 'overflow-y': 'auto' } },
              result.map((i: { roleKey: string; name: string }) => {
                return h('div', { class: 'c-flex-ycenter' }, [
                  h(Icon, { name: 'module-role', color: 'white', class: 'c-mr5' }),
                  h('div', { innerHTML: i.name })
                ])
              })
            )
            ElMessageBox({ title: '拥有权限的角色', message, confirmButtonText: '确认', customClass: 'module-messaage-box' })
          } else {
            ElMessage({ type: 'warning', message: '当前模块权限未分配给任何角色' })
          }
        }
      })
      .finally(() => (roleBtnLoading.value = false))
  } else {
    ElMessage({ type: 'warning', message: '请选择需要查看的模块' })
  }
}

// 获取模块管理菜单数据
const tableLoading = shallowRef(false)
const modulesTree = shallowRef<Modules[]>([])
initData()
async function initData() {
  tableLoading.value = true
  modulesTree.value = await getModulesTree()
  tableLoading.value = false
}
</script>
