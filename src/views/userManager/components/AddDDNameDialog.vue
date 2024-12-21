<template>
  <el-dialog v-model="dialogVisible" title="添加钉钉账号" width="750" :append-to-body="true" draggable>
    <div>
      <c-search v-model:data="queryList" :config="searchConfig" />
      <c-table v-loading="tableLoading" :data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-h100p"> </c-table>
      <c-pagination v-if="tableData.length > 0" v-model:data="pagiData" @change="onSearch" />
    </div>
    <template #footer>
      <div class="c-flex-center">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="warning" @click="confirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { ref, shallowRef } from 'vue'
import { GetNotBindUser } from '@/views/userManager/request'

interface RowData {
  userName: string
  userId: string
  departName: string
  userPhone: string
}

const dialogVisible = shallowRef(false)
const queryList = shallowRef<QueryList>({})
const tableLoading = shallowRef<boolean>(false)
const tableData = shallowRef<RowData[]>([])
const currentRow = shallowRef<RowData>()
const pagiData = ref({ page: 1, pageSize: 20, total: 0 })

const selectChangeHandler = (row: RowData) => (currentRow.value = row)
const searchConfig = [
  { name: 'input', prop: 'userName', attr: { placeholder: '账号名' }, on: { change: onSearch } },
  { name: 'input', prop: 'userId', attr: { placeholder: '钉钉号' }, on: { change: onSearch } },
  { name: 'input', prop: 'departName', attr: { placeholder: '部门' }, on: { change: onSearch } },
  { name: 'input', prop: 'userPhone', attr: { placeholder: '电话' }, on: { change: onSearch } },
  { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: onSearch } }
]
const tableConfig = { height: '300px', stripe: false, on: { 'current-change': selectChangeHandler } }
const columnsConfig = [
  { slotName: 'radio' },
  { label: '账号', prop: 'userName', width: '100' },
  { label: '钉钉号', prop: 'userId', width: '200' },
  { label: '部门（钉钉架构）', prop: 'departName', width: '250' },
  { label: '电话', prop: 'userPhone', width: '140' }
]

const emit = defineEmits(['update'])
const confirm = () => {
  const { userName, userId } = currentRow.value ?? {}
  emit('update', { userName, userId })
  dialogVisible.value = false
}

const openDialog = () => {
  onSearch()
  dialogVisible.value = true
}

function onSearch() {
  const { page, pageSize } = pagiData.value
  const params = { ...queryList.value, page, limit: pageSize }
  tableLoading.value = true
  GetNotBindUser(params)
    .then((res) => {
      const { code, data, count } = res
      if (code === 200) {
        tableData.value = data
        pagiData.value.total = count
      }
    })
    .finally(() => {
      tableLoading.value = false
    })
}

defineExpose({ openDialog })
</script>

<style scoped lang="scss"></style>
