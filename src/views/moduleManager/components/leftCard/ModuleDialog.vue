<template>
  <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增' : '编辑'" width="450" :append-to-body="true" draggable>
    <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto" status-icon size="default">
      <el-form-item label="名称" prop="name">
        <el-input v-model="ruleForm.name" size="small" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="排序" prop="sortNo">
        <el-input-number v-model="ruleForm.sortNo" size="small" />
      </el-form-item>
      <el-form-item label="是否系统" prop="isSys">
        <el-switch v-model="ruleForm.isSys" size="small" />
      </el-form-item>
      <el-form-item label="模块标识" prop="code">
        <el-input v-model="ruleForm.code" size="small" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="图标" prop="iconName">
        <el-input v-model="ruleForm.iconName" size="small" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="url" prop="url">
        <el-input v-model="ruleForm.url" size="small" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="上级机构" prop="parentId">
        <el-tree-select v-model="ruleForm.parentId" :data="treeData" :render-after-expand="false" style="width: 240px" size="small" check-strictly />
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
import { shallowRef, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { ModuleForm } from '@/views/moduleManager/types'
import { AddModules, UpdateModules } from '@/views/moduleManager/request'
import { getModulesTree, type Modules } from '@/hooks/useSysBaseData'

const props = defineProps({
  data: {
    type: Array<Modules>,
    required: true
  }
})

const dialogType = shallowRef('')
const treeData = shallowRef()
const dialogVisible = shallowRef(false)
const ruleFormRef = shallowRef<FormInstance>()
let ruleForm = reactive<ModuleForm>({
  id: '',
  name: '',
  sortNo: 0,
  isSys: false,
  code: '',
  iconName: '',
  url: '',
  parentName: '',
  cascadeId: '',
  parentId: 'root',
  status: 0
})
const rules = reactive<FormRules<ModuleForm>>({
  name: [{ required: true, message: '', trigger: 'blur' }],
  code: [{ required: true, message: '', trigger: 'blur' }],
  url: [{ required: true, message: '', trigger: 'blur' }],
  parentId: [{ required: true, message: '', trigger: 'change' }]
})

watch(
  () => props.data,
  () => {
    const root = [{ value: 'root', label: '根节点', parentId: '' }]
    const formatData = (data: Modules[]): Modules[] => {
      return data.map((i) => {
        const children = i.children && i.children.length > 0 ? formatData(i.children) : i.children
        return { ...i, value: i.id, label: i.name, children }
      })
    }
    treeData.value = [...root, ...formatData(props.data)]
  },
  { immediate: true }
)

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      ruleForm.parentName = matchName(treeData.value, ruleForm.parentId)
      dialogType.value === 'add' ? request(AddModules) : request(UpdateModules)
    }
  })
}
type Api = (params: ModuleForm) => Promise<{ code: number }>
const btnLoading = shallowRef(false)
const emit = defineEmits(['update:data'])
function request(api: Api) {
  btnLoading.value = true
  const params = ruleForm.parentId === 'root' ? { ...ruleForm, parentId: null } : ruleForm
  api(params)
    .then(async (res) => {
      const { code } = res
      if (code === 200) {
        dialogVisible.value = false
        const newTreeData = await getModulesTree(true)
        emit('update:data', newTreeData)
        ElMessage({ type: 'success', message: '操作成功' })
      }
    })
    .finally(() => (btnLoading.value = false))
}
function matchName(data: Modules[], parentId: string | null) {
  let parentName = ''
  const matchFn = (curData: Modules[]): boolean =>
    curData.some((item) => {
      const { id, name, children } = item
      if (id === parentId) {
        parentName = name
        return true // 打到即中断循环
      } else {
        return children && children.length > 0 ? matchFn(children) : false
      }
    })
  matchFn(data)
  return parentName
}

const openDialog = (type: string, row?: Modules) => {
  dialogType.value = type
  const { id, name, sortNo, isSys, code, iconName, url, parentName, cascadeId, parentId, status } = row ?? {}
  const obj = row
    ? { id, name, sortNo, isSys, code, iconName, url, parentName, cascadeId, status, parentId: parentId || 'root' }
    : { id: '', name: '', sortNo: 0, isSys: false, code: '', iconName: '', url: '', parentName: '', cascadeId: '', parentId: 'root', status: 0 }
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
