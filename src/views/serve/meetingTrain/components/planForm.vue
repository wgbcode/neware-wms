<template>
  <el-dialog v-model="localVisible" :title="dialogTitle" width="500px" @close="handleClose" draggable :close-on-click-modal="false">
    <el-form :model="localForm">
      <c-table
        ref="table"
        :data="formItems"
        :columnsConfig="columnsConfig"
        :tableConfig="{ stripe: false, 'row-class-name': 'form-row' }"
        v-loading="tableLoading"
      >
        <template #details="{ row }">
          <component :is="getComponentType(row.type)" v-model="localForm[row.key]" v-bind="row">
            <el-option v-for="option in row.options" :key="option.value" :label="option.label" :value="option.value" />
          </component>
        </template>
      </c-table>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="warning" @click="handleSubmit" :loading="loading">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
// API
import { CreateTrainPlan, UpdateTrainPlan, TrainPlanDetails } from '../request'
import { ElMessage } from 'element-plus'

interface FormItem {
  key: string
  label: string
  type: 'input' | 'select' | 'radio' | 'checkbox' | 'date' | 'datetime'
  options?: Array<Record<string, string | number>>
  value?: any
  disabled?: boolean
}
interface LocalForm {
  [key: string]: string | number | number[]
  trainPlanMode: string | number
  trainPlanTopic: string
  trainPlanContent: string
  trainPlanCharacter: number[]
  trainPlanMethod: string | number
  trainPlanStartTime: string
  trainPlanEndTime: string
  speaker: string
  trainPlanAssessmentMethod: string | number
  desiredGoal: string
}
const props = defineProps<{
  modeList: Array<Record<string, string | number>>
  usersList: Array<AnyObject>
  methodList: Array<Record<string, string | number>>
  characterList: Array<Record<string, string | number>>
  getList: () => void
}>()
const columnsConfig = [{ slotName: 'index' }, { label: '要素', prop: 'label', width: 120 }, { label: '详情', prop: 'details', slotName: 'details' }]
const localVisible = ref(false)
const dialogTitle = ref('')
const optMode = ref('add')
const loading = ref(false)
const tableLoading = ref(false)
const defaultOptions = [
  {
    label: '现场分享',
    value: 1
  },
  {
    label: '课堂练习',
    value: 2
  }
]
const formItems = computed<FormItem[]>(() => [
  { key: 'trainPlanMode', label: '课程类型', type: 'select', options: props.modeList },
  { key: 'trainPlanTopic', label: '培训主题', type: 'input' },
  { key: 'trainPlanContent', label: '主要内容', type: 'input' },
  { key: 'trainPlanCharacter', label: '受训对象', type: 'select', options: props.characterList, multiple: true },
  { key: 'trainPlanMethod', label: '培训方式', type: 'select', options: props.methodList },
  { key: 'trainPlanStartTime', label: '计划培训开始日期', type: 'datetime', 'value-format': 'YYYY.MM.DD HH:mm:ss', format: 'YYYY.MM.DD HH:mm:ss' },
  { key: 'trainPlanEndTime', label: '计划培训结束日期', type: 'datetime', 'value-format': 'YYYY.MM.DD HH:mm:ss', format: 'YYYY.MM.DD HH:mm:ss' },
  { key: 'speaker', label: '主讲人', type: 'select', options: props.usersList, filterable: true },
  { key: 'trainPlanAssessmentMethod', label: '培训考核方式', type: 'select', options: defaultOptions },
  { key: 'desiredGoal', label: '期望目标', type: 'input' }
])
const initialForm = {
  trainPlanMode: '',
  trainPlanTopic: '',
  trainPlanContent: '',
  trainPlanCharacter: [] as number[],
  trainPlanMethod: '',
  trainPlanStartTime: '',
  trainPlanEndTime: '',
  speaker: '',
  trainPlanAssessmentMethod: '',
  desiredGoal: ''
}
const localForm = reactive<LocalForm>({ ...initialForm })
// 获取组件类型的方法
const getComponentType = (type: FormItem['type']) => {
  switch (type) {
    case 'input':
      return 'el-input'
    case 'select':
      return 'el-select'
    case 'datetime':
      return 'el-date-picker'
    default:
      return 'el-input'
  }
}
// 关闭弹窗并重置表单
const handleClose = () => {
  Object.assign(localForm, initialForm)
  localVisible.value = false
}

const checkForm = () => {
  for (const item of formItems.value) {
    const key = item.key as keyof typeof localForm
    const value = localForm[key]
    if (Array.isArray(value)) {
      if (value.length === 0) {
        ElMessage.warning(`请填写${item.label}`)
        return false
      }
    } else if (!value) {
      ElMessage.warning(`请填写${item.label}`)
      return false
    }
  }
  return true
}
// 提交表单
const handleSubmit = async () => {
  if (!checkForm()) {
    return
  }
  try {
    loading.value = true
    const requestData = {
      ...localForm,
      trainPlanCharacter: localForm.trainPlanCharacter.join(','),
      speaker: props.usersList?.find((item) => item.ddUserId === localForm.speaker)?.employName || '',
      speakerDDUserId: localForm.speaker || ''
    }
    const action = optMode.value === 'edit' ? UpdateTrainPlan : CreateTrainPlan
    const res = await action(requestData)
    if (res.code == 200) {
      ElMessage.success(optMode.value === 'edit' ? '更新成功' : '创建成功')
      handleClose()
      props.getList()
    }
  } catch (err: any) {
    ElMessage.warning(err.message)
  } finally {
    loading.value = false
  }
}
const trainPlanDetails = async (mode: 'add' | 'view' | 'edit' | 'copy', paramId?: string | number) => {
  try {
    if (!paramId) return
    tableLoading.value = true
    const res = await TrainPlanDetails({ id: paramId })
    if (res.code !== 200) {
      throw new Error(res.message)
    }
    let { trainPlanCharacter, speakerDDUserId, id, ...rest } = res.data
    // 处理不同的模式
    const filteredRest = mode === 'copy' ? { ...rest, trainPlanStartTime: '', trainPlanEndTime: '' } : { ...rest, id }
    // 动态处理其他大部分字段
    Object.assign(localForm, filteredRest)
    // 手动处理一些特殊字段
    localForm.speaker = speakerDDUserId
    localForm.trainPlanCharacter = trainPlanCharacter.split(',').map(Number)
  } catch (err: any) {
    ElMessage.warning(err.message)
  } finally {
    tableLoading.value = false
  }
}
// open 函数定义
const open = (title: string, mode: 'add' | 'view' | 'edit' | 'copy', id?: string | number) => {
  dialogTitle.value = title
  optMode.value = mode
  localVisible.value = true
  if (mode === 'edit' || mode === 'copy') {
    trainPlanDetails(mode, id)
  }
}
const close = () => {
  handleClose()
}
defineExpose({ open, close })
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
}
:deep(.el-date-editor.el-input) {
  width: 100%;
}

:deep(.el-input .el-input__wrapper) {
  padding: 0px 8px;
}

:deep(.current-row td.el-table__cell) {
  background: none !important;
}

:deep(.el-date-editor .el-input__wrapper) {
  padding: 0px 8px;
}
</style>
