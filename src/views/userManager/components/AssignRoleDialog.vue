<template>
  <div>
    <el-dialog v-model="dialogVisible" title="为用户分配角色" width="600" draggable :append-to-body="true">
      <div>
        <h2>{{ isInit ? '当前用户拥有的角色' : '即将为用户分配的角色' }}</h2>
        <p style="min-height: 100px; max-height: 250px; overflow: auto; color: var(--tc-label-text)">{{ curRuleNames }}</p>
      </div>
      <template #footer>
        <div class="c-flex-center">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="warning" @click="addRole">新增</el-button>
          <el-button type="warning" @click="confirmAdd" :loading="btnLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <RoleListDialog ref="roleListDialog" :ruleList="ruleList" v-model:curRuleIds="curRuleIds" v-model:isInit="isInit" />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed } from 'vue'
import { requestSuccess } from '@/utils/requestSuccess'
import RoleListDialog from './RoleListDialog.vue'
import { GetRolesTableData, Loadforuser, UnassignPemForRole, AssignPemForRole } from '@/views/roleManager/request'
import type { RoleRow } from '@/views/userManager/types'
import { ElMessage } from 'element-plus'

let userId = ''
const isInit = shallowRef(true)
const dialogVisible = shallowRef(false)
const btnLoading = shallowRef(false)
const ruleList = shallowRef<RoleRow[]>([])
const curRuleIds = shallowRef<string[]>([])
const curRuleNames = computed(() => {
  return ruleList.value.flatMap((i) => (curRuleIds.value.includes(i.id) ? i.name : [])).join('，')
})

// 初始化角色数据
requestSuccess({ api: GetRolesTableData, ref: ruleList })

const roleListDialog = shallowRef()
const addRole = () => roleListDialog.value?.openDialog()
const confirmAdd = async () => {
  await UnassignPemForRole({ firstId: userId, type: 'UserRole' })
  await AssignPemForRole({ firstId: userId, type: 'UserRole', secIds: curRuleIds.value })
  ElMessage({ type: 'success', message: '操作成功' })
  dialogVisible.value = false
}
const openDialog = (id: string) => {
  userId = id // 保存用户 id
  isInit.value = true
  requestSuccess({ api: Loadforuser, ref: curRuleIds, params: { userId: id } })
  dialogVisible.value = true
}
defineExpose({ openDialog })
</script>

<style scoped lang="scss"></style>
