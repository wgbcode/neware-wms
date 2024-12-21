<template>
  <ul>
    <li class="c-flex-column c-mb20">
      <span class="c-mb5">1、表格导入：将 excel 表转成 Json 数据</span>
      <el-upload ref="upload" drag multiple show-file-list :on-change="uploadFile" :limit="1" :auto-upload="false" :on-exceed="isExceedLimit">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
        <template #tip>
          <div class="el-upload__tip">只能上传 .xls 和 .xlsx 格式的文件</div>
        </template>
      </el-upload>
    </li>
    <li class="c-flex-column c-mb20">
      <span class="c-mb5">2、表格导出1：将 Json 数据转成 excel 表 </span>
      <el-button type="primary" class="c-w100" @click="jsonToExcel">导出</el-button>
    </li>
    <li class="c-flex-column">
      <span class="c-mb5">3、表格导出2：将 table DOM 转成 excel 表 </span>
      <c-table ref="myTable" v-model:data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1 c-mb5" />
      <el-button type="primary" class="c-w100" @click="domToExcel">导出</el-button>
    </li>
  </ul>
</template>

<script setup lang="tsx">
import { UploadFilled } from '@element-plus/icons-vue'
import { excelToJsonHandler, jsonToExcelHandler, domToExcelHandler } from '@/hooks/useExcel'
import { ElMessage, type UploadFile } from 'element-plus'
import { useTemplateRef } from 'vue'

// excel -> json
const isExceedLimit = () => {
  ElMessage({ type: 'warning', message: '每次只能上传一个文件' })
}
const uploadFile = async (uploadFile: UploadFile) => {
  const { raw } = uploadFile
  const types = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  if (raw && types.includes(raw.type)) {
    const jsonData = await excelToJsonHandler(raw)
    console.log({ jsonData })
    ElMessage({ type: 'success', message: '已完成表格数据解析，请将 JSON 数据回传后端' })
  } else {
    ElMessage({ type: 'warning', message: '只能上传 .xls 和 .xlsx 格式的文件' })
  }
}

// json -> excel
const ddArray = [
  ['S', 'h', 'e', 'e', 't', 'J', 'S'],
  [1, 2, 3, 4, 5, 6, 7],
  [1, 2, 3, 4, 5, 6, 7],
  [1, 2, 3, 4, 5, 6, 7]
]
const jsonToExcel = () => jsonToExcelHandler(ddArray, '测试.xls')

// DOM -> excel
const tableConfig = { height: '100%', width: '100%' }
const columnsConfig = [
  { slotName: 'index' },
  { label: '测试1', prop: 'test1', width: '150' },
  { label: '测试2', prop: 'test2', width: '150' },
  { label: '测试3', prop: 'test3', width: '150' },
  { label: '测试4', prop: 'test4', width: '150' },
  { label: '测试5', prop: 'test5', width: '150' }
]
const tableData = [
  { test1: 1, test2: 2, test3: 3, test4: 4, test5: 5 },
  { test1: 1, test2: 2, test3: 3, test4: 4, test5: 5 },
  { test1: 1, test2: 2, test3: 3, test4: 4, test5: 5 },
  { test1: 1, test2: 2, test3: 3, test4: 4, test5: 5 },
  { test1: 1, test2: 2, test3: 3, test4: 4, test5: 5 }
]
const myTable = useTemplateRef('myTable')
const domToExcel = () => domToExcelHandler(myTable, '测试.xls')
</script>

<style scoped lang="scss"></style>
