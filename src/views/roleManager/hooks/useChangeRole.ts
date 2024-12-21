import type { HookParams } from '../index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DeleteRole } from '@/views/roleManager/request'

export function useChangeRole(params: HookParams) {
  const { updateRoleDialog, selectedRow, getRolesTableData, requestMap, queryList } = params

  function openChangeRuleDialog(type: string) {
    if (type === 'add') {
      updateRoleDialog.value?.openDialog(type)
    } else {
      if (selectedRow.value) {
        updateRoleDialog.value?.openDialog(type, selectedRow.value)
      } else {
        ElMessage({ type: 'warning', message: '请选择角色' })
      }
    }
  }
  function removeRule() {
    if (selectedRow.value) {
      ElMessageBox.confirm(`是否确定删除该角色?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = selectedRow.value ? [selectedRow.value.id] : []
        DeleteRole(params).then((res) => {
          if (res.code === 200) {
            selectedRow.value && requestMap.delete(selectedRow.value.id) // 删除表格 list 字段缓存
            queryList.value = { key: '' } // 清空搜索项
            getRolesTableData() // 重新获取表格数据
            ElMessage({ type: 'success', message: '操作成功' })
          }
        })
      })
    } else {
      ElMessage({ type: 'warning', message: '请选择需要删除的模块' })
    }
  }
  return { openChangeRuleDialog, removeRule }
}
