<template>
  <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增' : '编辑'" width="450" :append-to-body="true" draggable>
    <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto" status-icon size="default">
      <el-form-item label="名称" prop="name">
        <el-input v-model="ruleForm.name" size="small" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="DOM ID" prop="domId">
        <el-input v-model="ruleForm.domId" size="small" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="所属模块" prop="moduleId">
        <el-tree-select v-model="ruleForm.moduleId" :data="treeData" :render-after-expand="false" style="width: 240px" size="small" check-strictly />
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
import type { BtnForm } from '@/views/moduleManager/types'
import { AddBtn, UpdateBtn } from '@/views/moduleManager/request'
import { getModulesTree, getAuthBtn, type Modules } from '@/hooks/useSysBaseData'

const dialogType = shallowRef('')
const treeData = shallowRef()
const dialogVisible = shallowRef(false)
const ruleFormRef = shallowRef<FormInstance>()
let ruleForm = reactive<BtnForm>({
  id: '',
  name: '',
  sort: 0,
  code: '',
  domId: '',
  moduleId: '',
  status: 0,
  cascadeId: ''
})
const rules = reactive<FormRules<BtnForm>>({
  name: [{ required: true, message: '', trigger: 'blur' }],
  domId: [{ required: true, message: '', trigger: 'blur' }],
  moduleId: [{ required: true, message: '', trigger: 'change' }]
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      dialogType.value === 'add' ? request(AddBtn) : request(UpdateBtn)
    }
  })
}
type Api = (params: BtnForm) => Promise<{ code: number }>
const btnLoading = shallowRef(false)
const emit = defineEmits(['update'])
function request(api: Api) {
  btnLoading.value = true
  api(ruleForm)
    .then(async (res) => {
      const { code } = res
      if (code === 200) {
        const data = await getAuthBtn(true)
        emit('update', data)
        dialogVisible.value = false
        ElMessage({ type: 'success', message: '操作成功' })
      }
    })
    .finally(() => (btnLoading.value = false))
}

const openDialog = async ({ type, row }: { type: string; row: Record<string, string> }) => {
  dialogType.value = type
  const data = await getModulesTree()
  treeData.value = formatData(data)
  const { id, moduleId, name, domId } = row
  const obj = { id, name, domId, moduleId, cascadeId: '', sort: 0, status: 0 }
  Object.assign(ruleForm, obj)
  dialogVisible.value = true
}
function formatData(data: Modules[]): Modules[] {
  return data.map((i) => {
    const children = i.children && i.children.length > 0 ? formatData(i.children) : i.children
    return { ...i, value: i.id, label: i.name, children }
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
