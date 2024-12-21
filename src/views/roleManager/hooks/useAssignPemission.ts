import type { HookParams } from '../index.vue'
import { ElMessage } from 'element-plus'
// import { DeleteRole } from '@/views/roleManager/request'

export function useAssignPemission(params: HookParams) {
  const { assignPemissionDialog, selectedRow } = params

  function openAssignDialog() {
    if (selectedRow.value) {
      assignPemissionDialog.value?.openDialog(selectedRow.value)
    } else {
      ElMessage({ type: 'warning', message: '请选择角色' })
    }
  }

  return { openAssignDialog }
}
