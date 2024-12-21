<template>
  <div class="pagination c-flex-yenter">
    <el-dropdown placement="top" class="limit" @command="limitHandler">
      <div class="text">{{ isPagAll ? option.totalCount : data.limit }}/页</div>
      <template #dropdown>
        <el-dropdown-menu>
          <!-- <el-dropdown-item :command="35">35/页</el-dropdown-item> -->
          <el-dropdown-item :command="200">200/页</el-dropdown-item>
          <el-dropdown-item :command="option.totalCount">全部</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown placement="top-start" :max-height="400" @command="pageHandler" class="page" @visible-change="visibleHandler">
      <div class="text">
        <el-input input-style="text-align: center" v-model="paginPage" style="width: 40px" @change="pageHandler" />
        <span class="c-ml2">页</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu ref="dropdownMenu">
          <el-dropdown-item v-for="page in pageCount" :key="page" :command="page">{{ page }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="tsx">
import { computed, shallowRef, watch, type PropType, useTemplateRef, type ComponentPublicInstance, nextTick } from 'vue'
import type { CompOption } from './index.vue'
const props = defineProps({
  option: {
    type: Object as PropType<CompOption>,
    required: true
  }
})
const data = defineModel<FooterData>('data', { required: true })
const isPagAll = shallowRef<boolean>(false)
const paginPage = shallowRef<number>(0)
watch(props, updatePaginpage, { immediate: true })
function updatePaginpage() {
  if (data.value.page) {
    paginPage.value = isPagAll.value ? 1 : data.value.page
  }
}
const pageCount = computed(() => {
  let result: number[] = []
  const { totalCount } = props.option
  const limit = data.value.limit
  if (limit && totalCount) {
    for (let i = 1; i < totalCount / limit + 1; i++) {
      result.push(i)
    }
  }
  return isPagAll.value ? [1] : result.reverse()
})
const emit = defineEmits<{ update: [params: FooterUpdateEvent] }>()
function limitHandler(limit: number) {
  const page = isPagAll.value ? 1 : data.value.page
  isPagAll.value = limit === props.option.totalCount
  data.value = { ...data.value, page, limit, isSelectAll: isPagAll.value }
  emit('update', { key: 'pagination', page, limit, isSelectAll: isPagAll.value })
}
function pageHandler(page: number | string) {
  const limit = isPagAll.value ? 200 : data.value.limit
  isPagAll.value = false
  data.value = { ...data.value, page: Number(page), limit, isSelectAll: isPagAll.value }
  emit('update', { key: 'pagination', page: Number(page), limit, isSelectAll: isPagAll.value })
}
const dropdownMenu = useTemplateRef<ComponentPublicInstance | null>('dropdownMenu')
async function visibleHandler(visible: boolean) {
  if (visible) {
    await nextTick()
    const scrollEl = dropdownMenu.value!.$el.parentElement.parentElement
    scrollEl.scrollTo({ top: pageCount.value.length * 24, behavior: 'smooth' })
  }
}
</script>

<style scoped lang="scss">
.pagination {
  margin-left: 15px;
  .limit {
    margin-right: 5px;
    .text {
      color: var(--tc-primary-text);
      border: 1px solid var(--tc-input-border);
      background-color: black;
      font-size: 12px;
      padding: 2px 12px;
      border-radius: 4px;
      outline: none;
      height: 18px;
    }
  }
  .page {
    .text {
      outline: none;
      display: flex;
      align-items: center;
      height: 18px;
      :deep(.el-input__wrapper) {
        height: 18px;
        --el-input-border-color: var(--tc-input-border);
      }
    }
  }
}
</style>
