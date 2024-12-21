<template>
  <div class="c-flex">
    <section class="c-flex-column c-w320 c-px10 c-pt1 c-pb10" style="background-color: var(--tc-content-background)">
      <c-search v-model:data="queryList1" :config="searchConfig1" />
      <div class="content-wrapper c-flex-1 c-pt10 c-flex-column c-overflow-hidden">
        <h3 @click="getAllType">全部字典>></h3>
        <div ref="typesEl" class="c-overflow-auto c-flex-1">
          <div
            v-for="item in typeData"
            :key="item.id"
            class="content c-flex-ycenter c-mb4 c-pl6 c-py4"
            @click="onSearch2(item.id)"
            :class="{ 'is-focus': item.id === queryList1.typeId }"
          >
            <Icon class="c-mr8" name="btn-categories" size="14px" color="var(--tc-label-text)" />
            <span class="c-fs13">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </section>
    <section class="c-flex-column c-flex-1" style="width: calc(100% - 320px)">
      <c-search v-model:data="queryList2" :config="searchConfig2" />
      <c-table v-loading="tableLoading" :data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1">
        <template #enable="{ row }">
          <span :style="{ color: row.enable ? 'var(--tc-global-green)' : 'var(--tc-global-red)' }">
            {{ row.enable ? '是' : '否' }}
          </span>
        </template>
      </c-table>
      <c-pagination v-if="tableData.length > 0" v-model:data="pagiData" @change="onSearch2" />
    </section>
    <AddCategoryTypeDialog ref="addCategoryTypeDialog" @update="onSearch1" />
    <UpdateCategoryDialog ref="updateCategoryDialog" :typeData="typeData" @update="onSearch2" />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import type { CategoryType, CategoryRow } from './types'
import { CategoryTypes, Categorys, DeleteCategory, DeleteCategoryTypes } from './request'
import { requestSuccess } from '@/utils/requestSuccess'
import UpdateCategoryDialog from './components/UpdateCategoryDialog.vue'
import AddCategoryTypeDialog from './components/AddCategoryTypeDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 初始化页面数据
const queryList1 = ref<QueryList>({ typeId: '' })
const queryList2 = ref<QueryList>({ key: '' })
const typeData = shallowRef<CategoryType[]>([])
const tableData = shallowRef<CategoryRow[]>([])
const pagiData = ref({ page: 1, pageSize: 50, total: 0 })
const tableLoading = shallowRef(false)
const typesEl = shallowRef()
onSearch1()

const searchConfig1 = [
  { name: 'input', prop: 'typeId', attr: { type: 'text' }, on: { change: onSearch1 } },
  { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: onSearch1 } },
  { name: 'button', text: '', attr: { type: 'warning', iconName: 'btn-add' }, on: { click: addCategoryTypes } },
  { name: 'button', text: '', attr: { type: 'danger', iconName: 'btn-delete' }, on: { click: deleteCategoryTypes } }
]
const searchConfig2 = [
  { name: 'input', prop: 'key', attr: { type: 'text' }, on: { change: () => onSearch2() } },
  { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: () => onSearch2() } },
  { name: 'button', text: '新增', attr: { type: 'primary', iconName: 'btn-add' }, on: { click: addCategory } },
  { name: 'button', text: '编辑', attr: { type: 'primary', iconName: 'btn-edit' }, on: { click: editCategory } },
  { name: 'button', text: '删除', attr: { type: 'primary', iconName: 'btn-delete' }, on: { click: deleteCategory } }
]

function getAllType() {
  onSearch2('')
  autoScroll()
}
function onSearch1() {
  const params = { page: 1, limit: 9999, key: queryList2.value.key }
  const cb = () => typeData.value.forEach((item, index) => (item.index = index))
  requestSuccess({ api: CategoryTypes, ref: typeData, params, cb })
  autoScroll()
  onSearch2()
}
// 自动滚动到指定位置
function autoScroll() {
  const typeId = queryList1.value.typeId
  const index = typeData.value.find((i) => i.id === typeId)?.index ?? 0
  typesEl.value?.scrollTo({ left: 0, top: index * 27.5 })
}
function onSearch2(id?: string) {
  const { page, pageSize } = pagiData.value
  if (typeof id === 'string') {
    queryList1.value.typeId = id
  }
  const params = { page, limit: pageSize, typeId: queryList1.value.typeId, key: queryList2.value.key }
  requestSuccess({ api: Categorys, ref: tableData, params, pagiRef: pagiData, loading: tableLoading })
}
const addCategoryTypeDialog = shallowRef()
const updateCategoryDialog = shallowRef()
const selectedData = shallowRef<CategoryRow[]>([])
function addCategoryTypes() {
  addCategoryTypeDialog.value.openDialog()
}
function deleteCategoryTypes() {
  if (queryList1.value.typeId) {
    ElMessageBox.confirm(`确定删除已选择的字典类型吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      DeleteCategoryTypes([queryList1.value.typeId]).then(async (res) => {
        if (res.code === 200) {
          queryList1.value.typeId = ''
          await onSearch1()
          ElMessage({ type: 'success', message: '操作成功' })
        }
      })
    })
  } else {
    ElMessage({ type: 'warning', message: '请选择需要删除的字典类型' })
  }
}
function addCategory() {
  updateCategoryDialog.value.openDialog('add')
}
function editCategory() {
  const length = selectedData.value.length
  if (length === 0) {
    ElMessage({ type: 'warning', message: '请选择需要编辑的字典' })
  } else if (length > 1) {
    ElMessage({ type: 'warning', message: '只能选择一个字典进行编辑' })
  } else {
    updateCategoryDialog.value.openDialog('edit', selectedData.value[0])
  }
}
function deleteCategory() {
  if (selectedData.value.length === 0) {
    ElMessage({ type: 'warning', message: '请选择需要删除的字典' })
  } else {
    ElMessageBox.confirm(`确定删除已选择的字典吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const params = selectedData.value.map((i) => i.id)
      DeleteCategory(params).then(async (res) => {
        if (res.code === 200) {
          await onSearch2()
          ElMessage({ type: 'success', message: '操作成功' })
        }
      })
    })
  }
}

const selectChangeHandler = (rows: CategoryRow[]) => (selectedData.value = rows)
const tableConfig = { height: '100%', width: '100%', stripe: false, on: { 'selection-change': selectChangeHandler } }
const columnsConfig = [
  { type: 'selection' },
  { label: '名称', prop: 'name', width: '120' },
  // { label: '代码', prop: 'dtCode', width: '100' },
  { label: '值', prop: 'dtValue', width: '250' },
  { label: '是否可用', prop: 'enable', width: '60', slotName: 'enable' },
  { label: '排序号', prop: 'sortNo', width: '50' },
  { label: '描述', prop: 'description', width: '100' },
  { label: '分类标识', prop: 'typeId', width: '200' },
  { label: '扩展字段', prop: 'extension', width: '100' },
  { label: '创建时间', prop: 'createTime', width: '130' },
  { label: '创建人', prop: 'createUserName', width: '90' },
  { label: '最后更新时间', prop: 'updateTime', width: '130' },
  { label: '最后更新人', prop: 'updateUserName', width: '100' }
]
</script>

<style scoped lang="scss">
.content-wrapper {
  border: 1px solid var(--tc-dialog-border);
  background-color: var(--tc-content-background);
  padding-left: 10px;
  padding-top: 5px;
  margin-right: 8px;
  h3 {
    padding-left: 6px;
    padding-bottom: 5px;
    font-weight: 700;
    color: var(--tc-label-text);
    &:hover {
      color: var(--tc-global-yellow);
      cursor: pointer;
    }
  }
  .content {
    color: var(--tc-primary-text);
    &:hover,
    &.is-focus {
      color: var(--tc-highlight-text);
      background-color: var(--tc-cell-selected);
      cursor: pointer;
    }
  }
}
</style>
