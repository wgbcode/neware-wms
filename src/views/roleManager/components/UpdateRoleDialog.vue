<template>
  <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增' : '编辑'" width="400" :append-to-body="true" draggable>
    <el-form ref="ruleFormRef" style="max-width: 400px" :model="ruleForm" :rules="rules" label-width="auto" status-icon size="default">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="ruleForm.name" size="small" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="角色标识" prop="roleKey">
        <el-input v-model="ruleForm.roleKey" size="small" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select-v2 v-model="ruleForm.status" :options="statusOptions" placeholder="请选择" size="small" :item-height="24" />
      </el-form-item>
      <el-form-item label="身份标识" prop="identity">
        <el-select-v2 v-model="ruleForm.identity" :options="identityOptions" placeholder="请选择" size="small" :item-height="24" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="c-flex-center">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="warning" @click="submitForm(ruleFormRef)" :loading="btnLoading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { shallowRef, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { RuleForm, RowData } from '@/views/roleManager/types'
import { GetCategoryNameList, AddRole, UpdateRole } from '@/views/roleManager/request'

const dialogType = shallowRef('')
const dialogVisible = shallowRef(false)
const ruleFormRef = shallowRef<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: '',
  roleKey: '',
  identity: '',
  status: 0,
  organizations: '',
  organizationIds: ''
})
const rules = reactive<FormRules<RuleForm>>({
  name: [{ required: true, message: '', trigger: 'blur' }],
  roleKey: [{ required: true, message: '', trigger: 'blur' }]
})
const statusOptions = [
  { value: 1, label: '停用' },
  { value: 0, label: '正常' }
]

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      dialogType.value === 'add' ? request(AddRole) : request(UpdateRole)
    }
  })
}
type Api = (params: RuleForm) => Promise<{ code: number }>
const btnLoading = shallowRef(false)
const emit = defineEmits(['getRolesTableData'])
function request(api: Api) {
  btnLoading.value = true
  api(ruleForm)
    .then((res) => {
      const { code } = res
      if (code === 200) {
        dialogVisible.value = false
        ElMessage({ type: 'success', message: '操作成功' })
        emit('getRolesTableData', ruleForm.name) // 更新表格
      }
    })
    .finally(() => (btnLoading.value = false))
}

const openDialog = (type: string, row?: RowData) => {
  dialogType.value = type
  const emptyObj = {
    name: '',
    identity: '',
    roleKey: '',
    status: 0,
    organizations: '',
    organizationIds: ''
  }
  const obj = row ? { ...emptyObj, ...row } : emptyObj
  Object.assign(ruleForm, obj)
  getCategoryNameList() // 获取身份标识下拉列表
  dialogVisible.value = true
}
const identityOptions = shallowRef([])
function getCategoryNameList() {
  GetCategoryNameList({ ids: 'SYS_RoleIdentification' }).then((res) => {
    const { code, data } = res
    if (code === 200) {
      identityOptions.value = data.map((i: Record<string, string>) => {
        return { value: i.dtValue, label: i.name }
      })
    }
  })
}

defineExpose({ openDialog })
</script>

<style scoped lang="scss">
:deep(.el-form) {
  padding: 0 12px;
}
:deep(.el-form-item) {
  margin-bottom: 0;
}
:deep(.el-form-item label) {
  font-size: 12px;
}
</style>
