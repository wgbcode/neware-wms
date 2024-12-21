<template>
  <div>
    <el-button type="primary" @click="openOfficeView">查看预览页面</el-button>
    <OfficeView ref="officeView" />
  </div>
</template>

<script setup lang="tsx">
import { useTemplateRef } from 'vue'
import { getToken } from '@/utils/auth'
import OfficeView, { type OfficeData } from '@/components/officeView/index.vue'

const officeView = useTemplateRef('officeView')
const officeData: OfficeData[] = [
  { type: 'docx', url: 'http://static.shanhuxueyuan.com/test6.docx' },
  { type: 'excel', url: 'http://static.shanhuxueyuan.com/demo/excel.xlsx' },
  { type: 'pdf', url: 'http://static.shanhuxueyuan.com/test.pdf' },
  { type: 'pdf', url: `http://192.168.0.207:52789/api/files/Download/8e15915a-7ddc-461c-bb50-60c558a3d9e3?X-Token=${getToken()}` },
  { type: 'img', url: `https://nsapgateway.neware.work/api/files/Download/0a007a9b-d1b1-4d14-8772-bfa4ea084bc2?X-Token=${getToken()}` }
]
function openOfficeView() {
  officeView.value!.showOffice(officeData)
}
</script>

<style scoped lang="scss"></style>
