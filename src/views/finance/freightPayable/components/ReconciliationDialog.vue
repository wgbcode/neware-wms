<template>
  <el-dialog v-model="dialogVisible" title="对账" :width="400" draggable>
    <p class="c-mb5 c-fs12">确认所选账单已对账完成?</p>
    <c-table ref="table" v-model:data="tableData" :columnsConfig="columnsConfig"> </c-table>
    <template #footer>
      <div class="c-flex-center">
        <el-button @click="dialogVisible = false">
          <Icon name="btn-close" size="13" class="c-mr2 c-mb1" />
          <span>取消</span>
        </el-button>
        <el-button type="warning" :loading="btnLoading" @click="confirm">
          <Icon v-show="!btnLoading" name="btn-confirm" size="13" class="c-mr2" />
          <span>确认</span>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { shallowRef } from 'vue'
import { IndexUpdateSetCheckMonth } from '../request'

interface RowData {
  count: number
  check_total: number
  checkMonth: string
}
interface Payable {
  source_id: number
  source_type: number
}
let curPayables: null | Payable[]
const dialogVisible = shallowRef<boolean>(false)
const btnLoading = shallowRef<boolean>(false)
const tableData = shallowRef<RowData[]>([])

const columnsConfig = [
  { label: '单据总额', prop: 'count', width: '100', align: 'right' },
  { label: '总计金额', prop: 'check_total', width: '120', slotName: 'price' },
  { label: '对账月份', prop: 'checkMonth', width: '150', slotName: 'datePicker', slotAttr: { type: 'month' } }
]

const openDialog = (data: RowData[], payables: Payable[]) => {
  curPayables = payables
  tableData.value = data
  dialogVisible.value = true
}
const emit = defineEmits(['onSearch'])
const confirm = () => {
  btnLoading.value = true
  const { check_total, checkMonth } = tableData.value[0]
  const params: AnyObject = { check_total, checkMonth: checkMonth.slice(0, 8), payables: curPayables }
  delete params['count']
  const newParams = { dtoStr: JSON.stringify(params) }
  IndexUpdateSetCheckMonth(newParams)
    .then((res) => {
      if (res.code === 200) {
        emit('onSearch')
        dialogVisible.value = false
      }
    })
    .finally(() => {
      btnLoading.value = false
    })
}

defineExpose({ openDialog })
</script>

<style scoped lang="scss"></style>
