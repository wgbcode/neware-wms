<template>
  <div>
    <ProcessBar :data="data" :fieldMap="fieldMap" :statusMap="statusMap" />
  </div>
</template>

<script setup lang="tsx">
import ProcessBar from '@/components/processBar/index.vue'

const statusMap = {
  pending: 0, // 未决
  agree: 1, // 同意
  reject: 2 // 驳回
}
const fieldMap = {
  name: 'name',
  status: 'status',
  time: 'time',
  intervalTime: 'intervalTime',
  info: 'info',
  infoFieldMap: {
    infoName: 'name',
    infoStatus: 'status'
  }
}
const data = [
  { name: '开始', status: 1, time: '2024.12.02 09:03:32', intervalTime: '1.19:04:34', info: [] },
  {
    name: '财务&工程审批',
    status: 1,
    time: '2024.12.02 09:03:32',
    intervalTime: '1.19:04:34',
    info: [
      { name: 'E2-刘静', status: 0 },
      { name: 'M1-李森', status: 1 }
    ]
  },
  {
    name: '总经理审批',
    status: 0,
    time: '2024.12.02 09:03:32',
    intervalTime: '1.19:04:34',
    info: [
      { name: 'E2-刘静', status: 0 },
      { name: 'M1-李森', status: 1 },
      { name: 'M1-陈李超', status: 2 }
    ]
  },
  { name: '结束', status: -1, time: '2024.12.02 09:03:32', intervalTime: '1.19:04:34', info: [] }
]
</script>

<style scoped lang="scss"></style>
