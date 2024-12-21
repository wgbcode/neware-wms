<template>
  <div>
    <el-dialog v-model="dialogVisible" title="添加字典类型" width="400" :append-to-body="true" draggable>
      <el-form ref="ruleFormRef" style="max-width: 400px" :model="ruleForm" :rules="rules" label-width="auto" status-icon size="default">
        <el-form-item label="分类id" prop="id">
          <el-input v-model="ruleForm.id" size="small" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="ruleForm.name" size="small" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="c-flex-center">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="warning" @click="submitForm(ruleFormRef)" :loading="btnLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="tsx" setup>
import { shallowRef, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { AddCategoryTypes } from '@/views/categories/request'
import { cloneDeep } from 'lodash-es'

interface AddCategoryType {
  id: string
  name: string
}
const emptyObj: AddCategoryType = {
  id: '',
  name: ''
}
const dialogVisible = shallowRef(false)
const ruleFormRef = shallowRef<FormInstance>()
const ruleForm = reactive<AddCategoryType>(cloneDeep(emptyObj))
const rules = reactive<FormRules<AddCategoryType>>({
  id: [{ required: true, message: '', trigger: 'blur' }],
  name: [{ required: true, message: '', trigger: 'blur' }]
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      request(AddCategoryTypes)
    }
  })
}
type Api = (params: AddCategoryType) => Promise<{ code: number }>
const btnLoading = shallowRef(false)
const emit = defineEmits(['update'])
async function request(api: Api) {
  btnLoading.value = true
  api(ruleForm)
    .then(async (res) => {
      const { code } = res
      if (code === 200) {
        dialogVisible.value = false
        ElMessage({ type: 'success', message: '操作成功' })
        emit('update') // 更新表格
      }
    })
    .finally(() => {
      btnLoading.value = false
    })
}

const openDialog = () => (dialogVisible.value = true)

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
