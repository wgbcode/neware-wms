<template>
  <div class="form-table">
    <el-row class="collapse-title" style="line-height: normal">
      <!-- <span class="num">{{ titleNum[type] }}</span>
      <span class="num">{{ index + 1 }}</span>
     <span class="label">——{{ tableValue.callThemeName }} ({{ props.tableValue.callThemeCode }})</span> -->
    </el-row>
    <el-row>
      <c-table ref="table" :data="dataList" :columnsConfig="commonColumns">
        <!-- 确认参数表头 -->
        <template #paramHeader="{ label }">
          <div class="table-header">
            <span>{{ label }}</span>
            <el-tooltip effect="dark" placement="top-end" content="由售后工程报部报价环节人员填写，接单技术员服务过程中可添加">
              <div class="header-icon">
                <img :src="iconQuestion" alt="SVG Icon" />
              </div>
            </el-tooltip>
          </div>
        </template>
        <template #param="{ row, index }">
          <el-input
            v-if="isEdit && index == dataList.length - 1"
            size="small"
            class="pointer"
            readonly
            placeholder="请输入确认参数 (保存为此设备模板)"
            @click="handleRowAdd()"
          ></el-input>
          <span v-else class="text-span"> {{ row.param }}</span>
        </template>
        <template #option="{ row, index }">
          <el-select
            size="small"
            clearable
            v-model="row.value"
            :disabled="!isEdit"
            v-if="!(isEdit && index == dataList.length - 1)"
            @change="handleSelect"
          >
            <el-option v-for="item in row.options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </template>
        <template #description="{ row, index }">
          <el-input size="small" v-model="row.description" :disabled="!isEdit" v-if="!(isEdit && index == dataList.length - 1)"></el-input>
        </template>
        <template #oper="{ index }">
          <div v-if="isEdit" class="text-span">
            <img :src="iconFormAdd" v-if="index == dataList.length - 1" class="pointer" alt="SVG Icon" @click="handleRowAdd()" />
            <img
              :src="iconFormDelete"
              v-if="index != dataList.length - 1"
              class="pointer last-pointer"
              alt="SVG Icon"
              @click="handleRowDelete(index)"
            />
          </div>
        </template>
      </c-table>
    </el-row>
  </div>
</template>

<script setup lang="tsx">
// vue
import { shallowRef } from 'vue'
// utils
import { getURL } from '@/utils/common'
const props = defineProps({
  tableValue: {
    default: null
  },
  isEdit: {
    default: false
  },
  type: {
    default: ''
  },
  index: {
    default: 1
  }
})
// const titleNum = {
//   2: '2.1.2.',
//   3: '2.1.3.',
//   4: '2.2.',
//   5: '2.3.',
//   6: '2.4.',
//   7: '2.5.',
//   8: '2.6.'
// }
const iconQuestion = getURL('assets/icons/icon-sn-protected.svg')
const iconFormAdd = getURL('assets/icons/icon-form-add.svg')
const iconFormDelete = getURL('assets/icons/icon-form-delete.svg')
const dataList = shallowRef<AnyObject[]>([{}])
const commonColumns = shallowRef([
  { label: '#', type: 'index', width: 40 },
  { label: '确认参数', prop: 'param', slotName: 'param', width: 400 },
  { label: '选项', prop: 'option', slotName: 'option', width: 150 },
  { label: '问题详情', slotName: 'description', width: 150 },
  { label: '操作', slotName: 'oper', 'show-overflow-tooltip': false, width: 52 }
])
function handleRowAdd() {}
function handleSelect() {}
function handleRowDelete(index: any) {
  console.log(index, props.type)
}
</script>
<style lang="scss" scoped></style>
