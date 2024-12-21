<template>
  <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增' : '编辑'" width="400" :append-to-body="true" draggable>
    <el-form ref="ruleFormRef" style="max-width: 400px" :model="ruleForm" :rules="rules" label-width="auto" status-icon size="default">
      <el-form-item label="所属公司" prop="corpId">
        <el-select-v2 v-model="ruleForm.corpId" :options="corpList" placeholder="请选择" size="small" :item-height="24" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="ruleForm.name" size="small" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select-v2 v-model="ruleForm.status" :options="statusList" placeholder="请选择" size="small" :item-height="24" />
      </el-form-item>
      <el-form-item label="上级机构" prop="parentId">
        <el-tree-select
          v-model="ruleForm.parentId"
          :data="subOrgList"
          :render-after-expand="false"
          size="small"
          check-strictly
          :props="{ value: 'id', label: 'name' }"
        />
      </el-form-item>
      <el-form-item v-if="dialogType !== 'add'" label="部门主管" prop="deptManager">
        <el-select-v2
          v-model="ruleForm.deptManager"
          :options="deptManagerList"
          placeholder="请选择"
          size="small"
          :item-height="24"
          multiple
          filterable
        />
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
import type { UpdateOrgParams } from '@/views/orgManager/types'
import { AddOrg, EditOrg } from '@/views/orgManager/request'
import { LoadUsers } from '@/views/userManager/request'
import { requestList } from '@/utils/requestList'
import { type SubOrgList } from '@/hooks/useSysBaseData'

defineProps({
  corpList: {
    type: Array<Record<string, string | number>>,
    required: true
  },
  subOrgList: {
    type: Array<SubOrgList>,
    required: true
  }
})

const dialogType = shallowRef('')
const dialogVisible = shallowRef(false)
const deptManagerList = shallowRef([])
const ruleFormRef = shallowRef<FormInstance>()
let ruleForm = reactive<UpdateOrgParams>({
  cascadeId: '',
  corpId: '',
  id: '',
  status: 0,
  name: '',
  parentId: '',
  parentName: '',
  deptManager: []
})
const rules = reactive<FormRules<UpdateOrgParams>>({
  corpId: [{ required: true, message: '', trigger: 'blur' }],
  name: [{ required: true, message: '', trigger: 'blur' }],
  parentId: [{ required: true, message: '', trigger: 'blur' }]
})
const statusList = [
  { value: 1, label: '停用' },
  { value: 0, label: '正常' }
]

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      dialogType.value === 'add' ? request(AddOrg) : request(EditOrg)
    }
  })
}
type Api = (data: UpdateOrgParams) => Promise<{ code: number }>
const btnLoading = shallowRef(false)
const emit = defineEmits(['update'])
function request(api: Api) {
  btnLoading.value = true
  if (ruleForm.parentId === 'root') {
    ruleForm.parentId = ''
  }
  api(ruleForm)
    .then((res) => {
      const { code } = res
      if (code === 200) {
        dialogVisible.value = false
        ElMessage({ type: 'success', message: '操作成功' })
        emit('update') // 更新数据
      }
    })
    .finally(() => (btnLoading.value = false))
}

const openDialog = (type: string, row?: SubOrgList) => {
  dialogType.value = type
  const emptyObj = {
    cascadeId: '',
    corpId: '',
    id: '',
    status: 0,
    name: '',
    parentId: '',
    parentName: '',
    deptManager: []
  }
  const obj = row ? { ...emptyObj, ...row, parentId: row.parentId ?? 'root', deptManager: row.userId } : emptyObj
  Object.assign(ruleForm, obj)
  // 获取用户下拉列表
  requestList(LoadUsers, deptManagerList, { value: 'id', label: 'name' }, { orgId: row?.id, limit: 1000 })
  dialogVisible.value = true
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
