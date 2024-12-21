<template>
  <div>
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增' : '编辑'" width="400" :append-to-body="true" draggable>
      <el-form ref="ruleFormRef" style="max-width: 400px" :model="ruleForm" :rules="rules" label-width="auto" status-icon size="default">
        <!-- <el-form-item label="分类标识" prop="dtCode">
          <el-input v-model="ruleForm.dtCode" size="small" placeholder="请输入" />
        </el-form-item> -->
        <el-form-item label="名称" prop="name">
          <el-input v-model="ruleForm.name" size="small" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="值" prop="dtValue">
          <el-input v-model="ruleForm.dtValue" size="small" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否可用" prop="enable">
          <el-select-v2 v-model="ruleForm.enable" :options="enableOptions" placeholder="请选择" size="small" :item-height="24" />
        </el-form-item>
        <el-form-item label="排序号" prop="sortNo">
          <el-input-number v-model="ruleForm.sortNo" size="small" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="ruleForm.description" size="small" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="所属分类ID" prop="typeId">
          <el-select-v2
            v-model="ruleForm.typeId"
            :options="typeData"
            placeholder="请选择"
            size="small"
            :item-height="24"
            :props="{ label: 'name', value: 'id' }"
          />
        </el-form-item>
        <el-form-item label="扩展字段" prop="extension">
          <el-input v-model="ruleForm.extension" size="small" placeholder="请输入" />
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
import type { CategoryRow, CategoryType } from '@/views/categories/types'
import { AddCategory, UpdateCategory } from '@/views/categories/request'
import { cloneDeep } from 'lodash-es'

defineProps({
  typeData: {
    type: Array<CategoryType>,
    default: () => []
  }
})

const emptyObj: Partial<CategoryRow> = {
  description: '',
  dtCode: '',
  dtValue: '',
  enable: true,
  extension: '',
  id: '',
  name: '',
  sortNo: 0,
  typeId: ''
}
const dialogType = shallowRef('')
const dialogVisible = shallowRef(false)
const ruleFormRef = shallowRef<FormInstance>()
const ruleForm = reactive<Partial<CategoryRow>>(cloneDeep(emptyObj))
const rules = reactive<FormRules<Partial<CategoryRow>>>({
  name: [{ required: true, message: '', trigger: 'blur' }],
  dtValue: [{ required: true, message: '', trigger: 'blur' }],
  // dtCode: [{ required: true, message: '', trigger: 'blur' }],
  typeId: [{ required: true, message: '', trigger: 'blur' }]
})
const enableOptions = [
  { value: true, label: '正常' },
  { value: false, label: '停用' }
]

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      dialogType.value === 'add' ? request(AddCategory) : request(UpdateCategory)
    }
  })
}
type Api = (params: Partial<CategoryRow>) => Promise<{ code: number }>
const btnLoading = shallowRef(false)
const emit = defineEmits(['update'])
async function request(api: Api) {
  btnLoading.value = true
  const params = { ...ruleForm }
  api(params)
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

const openDialog = (type: string, row?: CategoryRow) => {
  dialogType.value = type
  let obj = emptyObj
  if (type !== 'add' && row) {
    obj = { ...emptyObj, ...row }
  }
  Object.assign(ruleForm, obj)
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
