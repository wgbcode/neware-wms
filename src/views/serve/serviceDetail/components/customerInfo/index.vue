<template>
  <div class="customer-info">
    <c-table :data="tableData" :columnsConfig="columnsConfig"> </c-table>
    <c-table :data="terminalTableData" :columnsConfig="terminalColumnsConfig"> </c-table>
  </div>
</template>

<script setup lang="tsx">
// vue
import { ref, shallowRef } from 'vue'
const tableData = ref([{}])
const columnsConfig = shallowRef([
  { label: '业务伙伴代码', prop: 'customerId', slotName: 'customerId', align: 'left', width: 91, required: true },
  { label: '业务伙伴名称', prop: 'customerName', width: 167, required: true },
  { label: '联系人', prop: 'newestContacter', slotName: 'newestContacter', width: 120, required: true },
  { label: '联系方式', prop: 'newestContactTel', slotName: 'newestContactTel', width: 107, required: true },
  { label: '地址', prop: 'completeArea', slotName: 'completeArea', width: 140, required: true },
  { label: '详细地址', prop: 'addr', slotName: 'addr', width: 260, required: true },
  { label: '城市', prop: 'city', slotName: 'city', width: 120, required: true },
  { label: '州/省', prop: 'province', slotName: 'province', width: 120, required: true },
  { label: '国家', prop: 'country', slotName: 'country', width: 120, required: true },
  { label: '邮政编码', prop: 'postCode', slotName: 'postCode', width: 120 },
  { label: '邮箱', prop: 'email', slotName: 'email', width: 120, required: true }
])
const terminalTableData = ref([{}])
const terminalColumnsConfig = shallowRef([
  { label: '终端业务伙伴', prop: 'terminalCustomerId', width: 91, slotName: 'terminalCustomerId', required: true },
  { label: '终端业务伙伴名称', prop: 'terminalCustomer', width: 167, required: true }
])
</script>
<style lang="scss" scoped></style>
