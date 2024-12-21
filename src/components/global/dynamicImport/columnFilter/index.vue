<template>
  <!-- 父级元素需是 relative 定位，可自定义 top/right/zIndex -->
  <div v-clickoutside="() => (isShowCheckBox = false)" class="c-absolute c-flex-column-end"
    :style="{ top: top + 'px', right: right + 'px', 'z-index': zIndex }">
    <img :src="getImgURL('table-column-filter')" alt="" @click="isShowCheckBox = !isShowCheckBox" />
    <el-checkbox-group class="c-flex-column" v-if="isShowCheckBox" v-model="checkColumnList" @change="updateCheckList">
      <el-checkbox class="c-flex-ycenter" v-for="(item, index) in filterColumnConfig" :key="index"
        :label="item.label || item.headerName" :value="item.prop || item.field" />
    </el-checkbox-group>
  </div>
</template>

<script setup lang="tsx">
import { shallowRef, onMounted } from 'vue'
import { getImgURL } from '@/utils/common'
import { useRoute } from 'vue-router'
const props = defineProps({
  data: {
    type: Array<AnyObject>,
    required: true
  },
  top: {
    type: Number,
    default: 2
  },
  right: {
    type: Number,
    default: 10
  },
  zIndex: {
    type: Number,
    default: 9
  },
  // 弹窗页面使用时需多传此参数，区分路由页面
  dialogTable: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:data'])
const isShowCheckBox = shallowRef<boolean>(false)
const initColumnConfig = shallowRef<AnyObject[]>([])
const filterColumnConfig = shallowRef<AnyObject[]>()
const checkColumnList = shallowRef<string[]>()
const route = useRoute()
function changeLocalName() {
  const localName = route.path
  if (localName) {
    const parts = localName.split('/')
    parts.shift()
    if (parts.length > 0) {
      parts[0] = '_' + parts[0]
    }
    return parts.join('_')
  }
}
const newLocalName = changeLocalName()
const setNewColumn = (value: string[]) => {
  const newColumnsConfig = initColumnConfig.value
    .filter(
      (i) =>
        (i.prop && value.includes(i.prop)) ||
        (i.field && value.includes(i.field)) ||
        (i.type && ['expand', 'selection', 'index', 'checked'].includes(i.type)) ||
        (i.slotName && ['index'].includes(i.slotName)) ||
        (i.compName && ['treeExpand', 'fullWidthRowExpand'].includes(i.compName))
    )
    .map((i) => (i.hide === true ? { ...i, hide: false } : i))
  emit('update:data', newColumnsConfig)
}
onMounted(() => {
  initColumnConfig.value = props.data
  const localItem = localStorage.getItem(`'column_filter${props.dialogTable ? props.dialogTable : newLocalName}'`)
  if (localItem) {
    checkColumnList.value = JSON.parse(localItem) || []
    if (checkColumnList.value) {
      setNewColumn(checkColumnList.value)
    }
  } else {
    checkColumnList.value = props.data.flatMap((i) => {
      return i.hide === true ? [] : ((i.prop || i.field) ?? [])
    })
  }
  filterColumnConfig.value = initColumnConfig.value.filter(
    (i) =>
      !(i.type && ['expand', 'selection', 'index', 'checked'].includes(i.type)) &&
      !(i.slotName && ['index'].includes(i.slotName)) &&
      !(i.compName && ['treeExpand', 'fullWidthRowExpand'].includes(i.compName))
  )
})

const updateCheckList = (value: string[]) => {
  localStorage.setItem(`'column_filter${props.dialogTable ? props.dialogTable : newLocalName}'`, JSON.stringify(value))
  checkColumnList.value = value
  setNewColumn(value)
}
</script>

<style scoped lang="scss">
:deep(.el-checkbox-group) {
  margin-top: 8px;
  background-color: #333333;
  padding: 5px 0 5px 15px;

  .el-checkbox {
    --el-checkbox-text-color: var(--tc-primary-text);
    --el-checkbox-checked-text-color: var(--tc-primary-text);

    &:hover {
      color: var(--tc-global-yellow);
    }
  }
}
</style>
