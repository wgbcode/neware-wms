<template>
  <el-dialog v-model="dialogVisible" :title="assignOption?.title" :width="assignOption?.width" :append-to-body="true" draggable>
    <section v-if="assignType === typeSymbol.menu" class="content-wrapper" v-loading="dialogLoading">
      <el-tree
        :data="modulesTree"
        show-checkbox
        :check-strictly="true"
        :default-expand-all="true"
        @check-change="updateSelectedTree"
        node-key="id"
        :default-checked-keys="selectedModuleIds"
        :props="{ value: 'id', label: 'name', children: 'children' }"
      />
    </section>
    <section v-else-if="assignType === typeSymbol.btnAndData">
      <c-table v-model:data="selectedTreeData" :tableConfig="tableConfig" :columnsConfig="columnsConfig">
        <!-- :disabled="row.isSys" -->
        <template #permBtns="{ row }">
          <el-checkbox-group v-model="selectedBtnIds" class="checkbox-group">
            <el-checkbox
              v-for="(item, index) in allPermBtns.filter((i:PermBtn) => i.moduleId === row?.id)"
              :key="index"
              :label="item.name"
              :value="item.id"
            />
          </el-checkbox-group>
        </template>
        <!-- <template #permDatas="{ row }">
          <el-checkbox-group v-model="selectedPermBtnIds" class="checkbox-group">
            <el-checkbox
              v-for="(item, index) in allPermBtns.filter((i:PermBtn) => i.moduleId === row?.id)"
              :key="index"
              :label="item.name"
              :value="item.id"
              :disabled="row.isSys"
            />
          </el-checkbox-group>
        </template> -->
        <template #isSys="{ row }">
          <span :style="{ color: row.isSys ? 'var(--tc-global-red)' : 'var(--tc-global-gray)' }">{{ row.isSys ? '是' : '否' }}</span>
        </template>
      </c-table>
    </section>
    <template #footer>
      <div class="c-flex-center">
        <el-button v-for="item in btnsOption" :key="item.text" v-show="item.isShow" :type="item.type" @click="item.click" :loading="item?.loading">
          {{ item.text }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { shallowRef, computed } from 'vue'
import type { RowData } from '@/views/roleManager/types'
import { Loadforrole, Loadmenusforrole, UnassignPemForRole, AssignPemForRole } from '@/views/roleManager/request'
import { ElMessage } from 'element-plus'
import { requestSuccessAsync } from '@/utils/requestSuccess'
import { getModulesTree, getAuthBtn, type PermBtn, type Modules } from '@/hooks/useSysBaseData'

const dialogVisible = shallowRef(false)
const typeSymbol = {
  menu: Symbol(), // 分配菜单权限
  btnAndData: Symbol() // 分配按钮权限和数据权限
}
const assignType = shallowRef<symbol>()
const assignOption = computed(() => {
  const type = assignType.value
  const map = new Map([
    [type === typeSymbol.menu, { title: '为角色分配【菜单权限】', width: 500 }],
    [type === typeSymbol.btnAndData, { title: '为角色分配【按钮权限】和【数据权限】', width: 1200 }]
  ])
  return map.get(true)
})
const btnLoading = shallowRef(false)
const btnsOption = computed(() => {
  return [
    { isShow: true, type: '', click: () => (dialogVisible.value = false), text: '取消' },
    { isShow: assignType.value === typeSymbol.menu, type: 'warning', click: toggleType, text: '下一步' },
    { isShow: assignType.value === typeSymbol.btnAndData, type: 'warning', click: toggleType, text: '上一步' },
    { isShow: assignType.value === typeSymbol.btnAndData, type: 'success', click: confirm, text: '确定', loading: btnLoading.value }
  ]
})
function toggleType() {
  switch (assignType.value) {
    case typeSymbol.menu:
      if (selectedTreeData.value.length === 0) {
        ElMessage({ type: 'warning', message: '请选择菜单' })
      } else {
        assignType.value = typeSymbol.btnAndData
      }
      break
    case typeSymbol.btnAndData:
      assignType.value = typeSymbol.menu
      break
  }
}
function confirm() {
  // 分配菜单权限、按钮权限、数据权限
  btnLoading.value = true
  const promiseArr = [AssignForRole('RoleModule', selectedModuleIds.value), AssignForRole('RoleElement', selectedBtnIds.value)]
  Promise.all(promiseArr).then(() => {
    ElMessage({ type: 'success', message: '操作成功' })
    dialogVisible.value = false
    btnLoading.value = false
  })
}
function AssignForRole(type: string, ids: string[]) {
  return UnassignPemForRole({ type, firstId: roleId.value }).then((res) => {
    if (res.code === 200) {
      AssignPemForRole({ type, firstId: roleId.value, secIds: ids })
    }
  })
}

const roleId = shallowRef('')
const allPermBtns = shallowRef<PermBtn[]>([])
const selectedBtns = shallowRef<PermBtn[]>([])
const selectedBtnIds = shallowRef<string[]>([])
const modulesTree = shallowRef<Modules[]>([])

const dialogLoading = shallowRef(false)
const openDialog = async (row: RowData) => {
  dialogVisible.value = true
  roleId.value = row.id
  assignType.value = typeSymbol.menu
  // 获取所有菜单数据、所有权限按钮数据、当前角色已被分配的菜单权限和按钮权限数据
  dialogLoading.value = true
  modulesTree.value.length === 0 && (modulesTree.value = await getModulesTree())
  allPermBtns.value.length === 0 && (allPermBtns.value = await getAuthBtn())
  const promiseArr = [
    requestSuccessAsync({ api: Loadforrole, ref: selectedTreeData, params: { firstId: row.id } }),
    requestSuccessAsync({ api: Loadmenusforrole, ref: selectedBtns, params: { firstId: row.id } })
  ]
  Promise.all(promiseArr).then(() => {
    selectedBtnIds.value = selectedBtns.value.map((i) => i.id)
    selectedModuleIds.value = selectedTreeData.value.map((i) => i.id)
    dialogLoading.value = false
  })
}

// 获取菜单树中选中的节点
const selectedTreeData = shallowRef<Modules[]>([])
const selectedModuleIds = shallowRef<string[]>([])
const updateSelectedTree = (obj: Modules, isSelected: boolean) => {
  const index = selectedTreeData.value.findIndex((i) => i.id === obj.id)
  if (isSelected) {
    index !== -1 ? selectedTreeData.value.splice(index, 1, obj) : selectedTreeData.value.push(obj)
  } else {
    index !== -1 && selectedTreeData.value.splice(index, 1)
  }
  selectedModuleIds.value = selectedTreeData.value.map((i) => i.id)
}

const tableConfig = { height: '500', width: '100%', stripe: false, 'highlight-current-row': false }
const columnsConfig = [
  { slotName: 'index' },
  { label: '菜单', prop: 'name', width: 130 },
  { label: '父级', prop: 'parentName', width: 120 },
  { label: '是否系统', prop: 'isSys', slotName: 'isSys', width: 70 },
  { label: '分配按钮权限', prop: 'permBtns', slotName: 'permBtns', width: 400 },
  { label: '分配数据权限', prop: 'permDatas', slotName: 'permDatas', width: 400 }
]

defineExpose({ openDialog })
</script>

<style scoped lang="scss">
.content-wrapper {
  max-height: 500px;
  overflow-y: auto;
}
:deep(td:has(.checkbox-group) .cell) {
  justify-content: flex-start !important;
}
:deep(.el-checkbox.el-checkbox--small) {
  margin-right: 10px;
}
:deep(tr.el-table__row:has(.el-checkbox__input.is-checked) td) {
  background-color: transparent !important;
}
// 允许表格单元格换行
:deep(td.el-table__cell .cell) {
  height: 100% !important;
  min-height: 20px;
}
:deep(td.el-table__cell .cell > div) {
  max-height: none !important;
  flex-wrap: wrap;
}
</style>
