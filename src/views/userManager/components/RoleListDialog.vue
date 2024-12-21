<template>
  <div>
    <el-dialog v-model="dialogVisible" title="所有角色信息" width="510" :append-to-body="true" draggable>
      <c-table ref="table" :data="ruleList" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-h100p">
        <template #status="scope">
          <span class="c-tooltip" :style="{ color: scope?.status === 0 ? 'var(--tc-global-green)' : 'var(--tc-global-red)' }">
            {{ scope?.status === 0 ? '正常' : '停用' }}
          </span>
        </template>
      </c-table>
      <template #footer>
        <div class="c-flex-center">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="warning" @click="confirm" :loading="btnLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, watch, nextTick } from 'vue'
import type { RoleRow } from '@/views/userManager/types'

const props = defineProps({
  ruleList: {
    type: Array<RoleRow>,
    required: true
  },
  curRuleIds: {
    type: Array<string>
  }
})

const table = shallowRef()
watch(props, toggleRowSelection, { immediate: true })
async function toggleRowSelection() {
  await nextTick()
  const instance = table.value?.getInstance()
  instance?.data.forEach((row: RoleRow) => {
    if (props.curRuleIds?.includes(row.id)) {
      instance.toggleRowSelection(row, true) // 自动选中行
    }
  })
}

const dialogVisible = shallowRef(false)
const btnLoading = shallowRef(false)
const selectedRows = shallowRef<RoleRow[]>([])
const selectChangeHandler = (rows: RoleRow[]) => (selectedRows.value = rows)
const tableConfig = { height: '300px', stripe: false, on: { 'selection-change': selectChangeHandler } }
const columnsConfig = [
  { type: 'selection' },
  { label: '角色名称', prop: 'name', width: '150' },
  { label: '角色 Key', prop: 'roleKey', width: '250' },
  { label: '状态', prop: 'status', width: '60', slotName: 'status' }
]
const emit = defineEmits(['update:curRuleIds', 'update:isInit'])
const confirm = () => {
  const ids = selectedRows.value.map((i) => i.id)
  emit('update:curRuleIds', ids)
  emit('update:isInit', false)
  dialogVisible.value = false
}
const openDialog = () => {
  dialogVisible.value = true
  selectedRows.value = []
  toggleRowSelection()
}
defineExpose({ openDialog })
</script>

<style scoped lang="scss"></style>
