<template>
  <el-dialog v-model="dialogVisible" title="上传文件" width="500">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="options.url"
      :accept="options.accept"
      :limit="options.limit"
      :auto-upload="false"
      style="min-height: 30px"
      :on-exceed="handleExceed"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      :headers="{ 'X-Token': authStore.token || getToken() }"
    >
      <template #trigger>
        <el-button type="primary">
          <Icon name="btn-upload-select" size="16" />
          <span class="c-ml4">选择文件</span>
        </el-button>
      </template>
      <!-- 需要上传到服务器 -->
      <el-button v-if="options.uploadServer" class="c-ml10 c-mb8" type="success" @click="submitUpload" :loading="btnLoading">
        <Icon v-show="!btnLoading" name="btn-upload-server" size="16" />
        <span class="c-ml4">开始上传</span>
      </el-button>
      <!-- 不用上传到服务器 -->
      <el-button v-else class="c-ml10 c-mb8" type="success" @click="updateFileInfo" :loading="btnLoading">
        <Icon v-show="!btnLoading" name="btn-confirm" size="12" />
        <span class="c-ml3">确认</span>
      </el-button>
    </el-upload>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { type UploadInstance, type UploadUserFile, type UploadRawFile, ElMessage } from 'element-plus'
import { authStore } from '@/stores/auth'
import { getToken } from '@/utils/auth'
import request from '@/utils/request'

export interface UploadOption {
  url?: string // 请求 URL
  accept?: string // 接受上传的文件类型
  limit?: number // 允许上传文件的最大数量
  maxSize?: number // 允许上传文件的最大体积，单位为 M
  uploadServer?: boolean // 是否需要上传到服务器
  multiple?: boolean // 是否支持多选文件
  data?: null | AnyObject // 上传时附带的额外请求参数
}

const emit = defineEmits(['submit', 'success'])
const defaultOptions = {
  url: '',
  accept: '.rar,.zip,.doc,.docx,.pdf,.xls,.xlsx,.jpg',
  limit: 100,
  maxSize: 10000,
  uploadServer: true,
  data: null
}
const options = ref<UploadOption>({ ...defaultOptions })
const fileList = ref<UploadUserFile[]>([]) // 已上传的文件列表
const dialogVisible = ref<boolean>(false)
const uploadRef = ref<UploadInstance>()
const btnLoading = ref<boolean>(false)
const updateFileInfo = () => {
  if (fileList.value.length === 0) {
    ElMessage({ type: 'warning', message: '请选择文件' })
  } else {
    emit('submit', fileList.value) // 将文件列表传给父级组件
    dialogVisible.value = false
  }
}
const submitUpload = () => {
  if (fileList.value.length === 0) {
    ElMessage({ type: 'warning', message: '请选择文件' })
  } else {
    // 判断是否有附加参数
    const { data, url } = options.value
    if (data) {
      const formData = new FormData()
      for (let key in data) {
        // 将附加参数全部转换成字符串
        formData.append(key, JSON.stringify(data[key]))
      }
      fileList.value.forEach((file) => formData.append('file', file.raw!))
      btnLoading.value = true
      request({ url, method: 'POST', data: formData })
        .then((res) => {
          if (res.code === 200) {
            ElMessage({ type: 'success', message: '上传成功' })
            emit('success') // 通知父级文件已上传成功
          }
        })
        .finally(() => {
          btnLoading.value = false
          dialogVisible.value = false
        })
    } else {
      uploadRef.value!.submit()
    }
  }
}
// 打开文件上传弹窗
const openDialog = async (params: UploadOption) => {
  const { url, accept, limit, uploadServer, data } = params
  options.value = {
    ...defaultOptions,
    ...(url && { url }),
    ...(accept && { accept }),
    ...(limit && { limit }),
    ...(data && { data }),
    ...(uploadServer === false && { uploadServer: false })
  }
  dialogVisible.value = true
  // 清空文件列表
  await nextTick()
  fileList.value = []
  uploadRef.value!.clearFiles()
}
// 上传前校验文件大小
function beforeUpload(rawFile: UploadRawFile) {
  const isExceed = rawFile.size / 1024 / 1024 < (options.value.maxSize ?? defaultOptions.maxSize)
  if (!isExceed) {
    ElMessage({ type: 'warning', message: `上传文件大小不能超过${options.value.maxSize}M` })
  }
  return isExceed
}
// 上传失败、上传成功、上传文件超出限制
function handleError() {
  ElMessage({ type: 'error', message: '文件上传失败' })
}
function handleSuccess(res: AnyObject) {
  console.log('res', res)
  ElMessage({ type: 'success', message: '文件上传成功' })
  emit('success') // 通知父级文件已上传成功
}
function handleExceed() {
  ElMessage({ type: 'warning', message: `一次性最多上传${options.value.limit}个文件` })
}
defineExpose({ openDialog })
</script>
