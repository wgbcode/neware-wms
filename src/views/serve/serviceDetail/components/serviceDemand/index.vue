<template>
  <div class="service-demand">
    <el-collapse v-model="activeNames">
      <el-collapse-item name="1">
        <template #title>
          <div class="collapse-title">
            <span class="num">{{ props.num }}.1</span>
            <span class="label">信息收集表</span>
          </div>
        </template>
        <c-table ref="infoRef" :data="infoCollectionList" :columnsConfig="infoCollectionColumns">
          <!-- 序列号 -->
          <template #manufacturerSerialNumber="row">
            <div class="serial-number-input" :class="{ disabled: !isSerialNumberEdit }" @click="handleSerialNumberClick(row)">
              <div>{{ row.manufacturerSerialNumber }}</div>
              <div v-if="row.manufacturerSerialNumber" class="wrapper-icon">
                <img :src="iconProtected" alt="SVG Icon" v-if="row.isProtected" />
                <img :src="iconOut" alt="SVG Icon" v-else />
              </div>
            </div>
          </template>
          <!-- 呼叫主题 -->
          <template #themeList="{ index, row }">
            <!-- handlePushFormTheme -->
            <div class="form-theme-content" v-if="row.themeList && row.themeList.length" @click="handleThemeClick($event, index, row)">
              <el-scrollbar wrapClass="scroll-wrap-class">
                <div class="form-theme-list">
                  <transition-group name="list" tag="ul">
                    <li class="form-theme-item" v-for="(themeItem, themeIndex) in row.themeList" :key="themeItem.id">
                      <el-tooltip popper-class="form-theme-toolip" effect="dark" :content="themeItem.description" placement="top">
                        <div class="text" @click="handleThemeItemClick(themeItem)" @contextmenu.prevent="handleRightClick(themeItem)">
                          <span> {{ themeItem.callThemeCode || themeItem.code || themeItem.description }}</span>
                          <span v-if="!isSerialNumberEdit && themeIndex != row.themeList.length - 1">{{ `,` }}</span>
                          <span class="sop-tag" v-if="themeItem.hasSOP">SOP</span>
                        </div>
                      </el-tooltip>
                      <i v-if="!row.isDisabled" class="icon-theme-close" @click.stop="handleDeleteTheme(row, themeIndex)"> </i>
                    </li>
                  </transition-group>
                </div>
              </el-scrollbar>
            </div>
          </template>
          <!-- 补充信息 -->
          <template #remark="{ row }">
            <el-input v-if="isMsgEdit" size="small" v-model="row.remark" @change="handleInfoChange"></el-input>
            <div class="text-span" v-else>{{ row.remark }}</div>
          </template>
          <!-- 附件 -->
          <template #file="{ row }">
            <div class="text-span" style="display: flex; max-height: 20px">
              <el-tooltip effect="dark" content="最多上传5个附件" placement="top">
                <div v-if="row && row.extraFilesLst">{{ row.extraFilesLst }}</div>
              </el-tooltip>
            </div>
          </template>
          <!-- 操作 -->
          <template #oper="{ row, index }">
            <div v-if="isSerialNumberEdit" class="text-span">
              <img
                :src="iconFormAdd"
                style="margin-right: 8px"
                v-if="index == infoCollectionList.length - 1"
                class="pointer"
                alt="SVG Icon"
                @click="handleSerialNumberClick(null)"
              />
              <img :src="iconFormDelete" v-if="showDeleteIcon(row, index)" class="pointer" alt="SVG Icon" @click="handleInfoDelete(index)" />
            </div>
          </template>
        </c-table>
        <el-collapse v-model="infoActiveNames">
          <el-collapse-item name="1">
            <template #title>
              <div class="collapse-title">
                <span class="num">{{ num }}.1.1</span>
                <span class="label">基础信息</span>
              </div>
            </template>
            <div class="table">
              <!-- 基础信息 -->
              <c-table ref="table" :data="baseInfoList" :columnsConfig="baseInfoColumns">
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
                <!-- 确认参数 -->
                <template #param="{ row }">
                  <span class="text-span">
                    <span class="red-star">*</span>
                    <span>{{ row.param }}</span>
                  </span>
                </template>
                <template #option="{ row }">
                  <el-select size="small" v-model="row.value" :disabled="!isMsgEdit" @change="handleOptionChange(row)">
                    <el-option v-for="(item, index) in row.options" :key="index" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </template>
                <template #description="{ row }">
                  <el-input size="small" v-model="row.description" :disabled="!isMsgEdit"></el-input>
                </template>
              </c-table>
            </div>
          </el-collapse-item>
          <el-collapse-item name="2" element-loading-text="" element-loading-spinner="el-icon-loading">
            <template #title>
              <div class="collapse-title">
                <span class="num">{{ num }}.1.2</span>
                <span class="label">软件问题</span>
              </div>
            </template>
            <div class="table">
              <!-- 软件问题 -->
              <questionTable
                v-for="(item, index) in tableList.softList"
                :key="item.completeCode"
                :index="index"
                :tableValue="item"
                type="2"
                :isEdit="isMsgEdit"
                @editTableList="handleEdit"
              >
              </questionTable>
            </div>
          </el-collapse-item>
          <el-collapse-item name="3" element-loading-text="" element-loading-spinner="el-icon-loading">
            <template #title>
              <div class="collapse-title">
                <span class="num">{{ num }}.1.3</span>
                <span class="label">硬件问题</span>
              </div>
            </template>
            <div class="table">
              <!-- 硬件问题 -->
              <questionTable
                v-for="(item, index) in tableList.hardwareList"
                :key="item.completeCode"
                :index="index"
                :tableValue="item"
                type="3"
                :isEdit="isMsgEdit"
                @editTableList="handleEdit"
              ></questionTable>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-collapse-item>
      <el-collapse-item name="2" element-loading-text="" element-loading-spinner="el-icon-loading">
        <template #title>
          <div class="collapse-title">
            <span class="num">{{ num }}.2</span>
            <span class="label">中位机</span>
          </div>
        </template>
        <div class="table">
          <!-- 中位机 -->
          <questionTable
            v-for="(item, index) in tableList.mediancomputerList"
            :key="item.completeCode"
            :index="index"
            :tableValue="item"
            type="4"
            :isEdit="isMsgEdit"
            @editTableList="handleEdit"
          ></questionTable>
        </div>
      </el-collapse-item>
      <el-collapse-item name="3" element-loading-text="" element-loading-spinner="el-icon-loading">
        <template #title>
          <div class="collapse-title">
            <span class="num">{{ num }}.3</span>
            <span class="label">温箱</span>
          </div>
        </template>
        <div class="table">
          <!-- 温箱 -->
          <questionTable
            v-for="(item, index) in tableList.incubatorList"
            :key="item.completeCode"
            :index="index"
            :tableValue="item"
            type="5"
            :isEdit="isMsgEdit"
            @editTableList="handleEdit"
          ></questionTable>
        </div>
      </el-collapse-item>
      <el-collapse-item name="4" element-loading-text="" element-loading-spinner="el-icon-loading">
        <template #title>
          <div class="collapse-title">
            <span class="num">{{ num }}.4</span>
            <span class="label">校准工装</span>
          </div>
        </template>
        <div class="table">
          <!-- 校准工装 -->
          <questionTable
            v-for="(item, index) in tableList.calibrationtoolingList"
            :key="item.completeCode"
            :index="index"
            :tableValue="item"
            type="6"
            :isEdit="isMsgEdit"
            @editTableList="handleEdit"
          ></questionTable>
        </div>
      </el-collapse-item>
      <el-collapse-item name="5" element-loading-text="" element-loading-spinner="el-icon-loading">
        <template #title>
          <div class="collapse-title">
            <span class="num">{{ num }}.5</span>
            <span class="label">自动化</span>
          </div>
        </template>
        <div class="table">
          <!-- 自动化 -->
          <questionTable
            v-for="(item, index) in tableList.automationList"
            :key="item.completeCode"
            :index="index"
            :tableValue="item"
            type="7"
            :isEdit="isMsgEdit"
            @editTableList="handleEdit"
          ></questionTable>
        </div>
      </el-collapse-item>
      <el-collapse-item name="6" element-loading-text="" element-loading-spinner="el-icon-loading">
        <template #title>
          <div class="collapse-title">
            <span class="num">{{ num }}.6</span>
            <span class="label">其他</span>
          </div>
        </template>
        <div class="table">
          <!-- 其他 -->
          <questionTable
            v-for="(item, index) in tableList.othersList"
            :key="item.completeCode"
            :index="index"
            :tableValue="item"
            type="8"
            :isEdit="isMsgEdit"
            @editTableList="handleEdit"
          ></questionTable>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="tsx">
import { shallowRef, onMounted, watch } from 'vue'
// utils
import { omit, cloneDeep } from 'lodash-es'
import questionTable from './questionTable.vue'
import { getServiceOrderQuestions } from '@/views/serve/serviceDetail/request'
// resource
import { questionTypeList, iconQuestion, iconProtected, iconOut, iconFormAdd, iconFormDelete } from '@/views/serve/serviceDetail/resource'
import type { collectionBaseInfo } from '@/views/serve/serviceDetail/serviceDetailTypes'
const props = defineProps({
  serviceOrderId: {
    default: null
  },
  customerData: {
    default: {}
  },
  currentNode: {
    default: null
  },
  isMsgEdit: {
    default: false
  },
  isSerialNumberEdit: {
    default: false
  },
  quotation: {
    type: Object,
    default: null
  },
  num: {
    default: '2'
  }
})
const activeNames = shallowRef<string[]>(['1'])
const infoActiveNames = shallowRef<string[]>([])
const infoCollectionList = shallowRef<AnyObject[]>([{ oper: '' }]) // 信息收集表
const baseInfoList = shallowRef<collectionBaseInfo[]>([{ param: '' }]) // 基础信息列表
const questionList = shallowRef<AnyObject[]>([]) // 问题列表
// 信息问题表
const tableList = shallowRef<AnyObject>({
  softList: [], // 软件信息
  hardwareList: [], // 硬件信息
  mediancomputerList: [], // 中位机信息
  incubatorList: [], // 温箱信息
  calibrationtoolingList: [], // 温箱信息
  automationList: [], // 自动化信息
  othersList: [] // 其他信息
})
const infoCollectionColumns = shallowRef([
  { label: '#', type: 'index', width: 27 },
  { label: '设备序列号', prop: 'manufacturerSerialNumber', slotName: 'manufacturerSerialNumber', width: 120 },
  { label: '物料编码', prop: 'materialCode', width: 200 },
  { label: '呼叫主题', prop: 'themeList', slotName: 'themeList', width: 240 },
  { label: '补充信息', prop: 'remark', slotName: 'remark', headerName: 'remarkHeader', isCustomizeHeader: true, width: 290 },
  { label: '附件', slotName: 'file', width: 140 },
  { label: '操作', slotName: 'oper', 'show-overflow-tooltip': false, width: 52 }
])
const baseInfoColumns = shallowRef([
  { label: '#', type: 'index', width: 27 },
  { label: '确认参数', prop: 'param', slotName: 'param', width: 250 },
  { label: '选项', slotName: 'option', width: 150 },
  { label: '补充描述', slotName: 'description', width: 150 },
  { label: '操作', slotName: 'oper', 'show-overflow-tooltip': false, width: 52 }
])
// 页面数据初始化
onMounted(() => {
  initBaseInfo()
  initQuestionInfo()
})
function initBaseInfo() {
  let list: collectionBaseInfo[] = []
  let row1 = {
    param: '硬件/软件问题',
    options: [
      { label: '硬件', value: '1' },
      { label: '软件', value: '2' }
    ],
    value: '1',
    description: '',
    questionType: '1'
  }
  let row2 = {
    param: '是否新设备安装',
    options: [
      { label: '是', value: '1' },
      { label: '否', value: '2' },
      { label: '未知', value: '3' }
    ],
    value: '1',
    description: '',
    questionType: '1'
  }
  let row3 = {
    param: '是否使用过新威产品',
    options: [
      { label: '是', value: '1' },
      { label: '否', value: '2' },
      { label: '不相关', value: '3' },
      { label: '未知', value: '4' }
    ],
    value: '1',
    description: '',
    questionType: '1'
  }
  list = [...[row1, row2, row3]] as Array<collectionBaseInfo>
  baseInfoList.value = list
  infoActiveNames.value = ['1']
}
// 初始化问题信息
async function initQuestionInfo() {
  if (!props.serviceOrderId) {
    return
  }
  // 调用接口
  const res = await getServiceOrderQuestions({ serviceOrderId: props.serviceOrderId })
  questionList.value = res?.data || []
  // this.hasSearchQuestion = true // 表示已经查过数据
  // this.$emit('questionList',this.questionList.filter((item) => item.callThemeName !== '基本信息')) // 非基本信息的问题列表
  if (questionList.value && questionList.value?.length > 0) {
    questionList.value.forEach((item: AnyObject) => {
      if (item.questionType == questionTypeList['基础信息']) {
        // 直接替换原值得
        let selectItem = baseInfoList.value.find((o: AnyObject) => o.param == item.confirmValue)
        if (selectItem) {
          const arrOptions = JSON.parse(item.optionJson)
          const selectOption = arrOptions.find((o: AnyObject) => o.selected == true)
          const selectValue = selectOption?.optionValue
          selectItem.description = item.description
          selectItem.value = selectValue
        }
      } else if (item.questionType == questionTypeList['软件问题']) {
        formatTable(tableList.value.softList, item)
      } else if (item.questionType == questionTypeList['硬件问题']) {
        formatTable(tableList.value.hardwareList, item)
      } else if (item.questionType == questionTypeList['中位机']) {
        formatTable(tableList.value.mediancomputerList, item)
      } else if (item.questionType == questionTypeList['温箱']) {
        formatTable(tableList.value.incubatorList, item)
      } else if (item.questionType == questionTypeList['校准工装']) {
        formatTable(tableList.value.calibrationtoolingList, item)
      } else if (item.questionType == questionTypeList['自动化']) {
        formatTable(tableList.value.automationList, item)
      } else if (item.questionType == questionTypeList['其它']) {
        formatTable(tableList.value.othersList, item)
      }
    })
  }
}
// 分层结构
function formatTable(tableList: AnyObject, item: AnyObject) {
  // 编辑项在组件内自动添加
  let themeTable = tableList.find((o: AnyObject) => o.completeCode === item.completeCode)
  const formatRow = (item: AnyObject): AnyObject | null => {
    try {
      let arrOptions = []
      if (item.optionJson) {
        arrOptions = JSON.parse(item.optionJson)
      } else {
        arrOptions = item.callthemeQuestionOptions
      }
      const selectOption = arrOptions.find((o: AnyObject) => o.selected == true)
      const selectValue = selectOption?.optionValue
      return {
        callthemeId: item.callthemeId || '',
        callThemeCode: item.callThemeCode || '',
        callThemeName: item.callThemeName || '',
        completeCode: item.completeCode || '',
        questionType: item.questionType,
        description: item.description,
        param: item.confirmValue,
        value: selectValue,
        options: arrOptions.map((obj: AnyObject) => {
          return {
            selected: obj.selected || false,
            value: obj.optionValue,
            label: obj.optionName
          }
        })
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }
  const rowRes: AnyObject | null = formatRow(item)
  if (themeTable) {
    let list = themeTable.list
    list = list.filter((item: AnyObject) => item.param !== '') // 跳过空数据
    rowRes && list.push(rowRes)
    themeTable.list = list
  } else {
    // 不存在，添加表
    let result = {
      callthemeId: item.callthemeId,
      callThemeCode: item.callThemeCode,
      callThemeName: item.callThemeName,
      completeCode: item.completeCode,
      questionType: item.questionType,
      list: rowRes ? [rowRes] : []
    }
    tableList.push(result)
  }
}
watch(
  () => props.quotation,
  (value) => {
    if (value) {
      let flatQuoList: AnyObject[] = []
      const quotation = value?.quotation as AnyObject | null
      const serviceWorkOrders = value?.serviceWorkOrders as AnyObject[] | any[]
      if (quotation && quotation?.quotationProducts?.length > 0) {
        // 报价单
        flatQuoList = cloneDeep(quotation?.quotationProducts) || []
        infoCollectionList.value = flatQuoList.map((item: AnyObject) => {
          return {
            ...item,
            extraFilesLst: item.extraFilesLst || [], // extraFilesLst为空时会报错
            children: item.quotationMaterials || [{}],
            salesOrder: item.saleOrder, // 服务单、序列号是salesOrder，报价单是saleOrder
            manufacturerSerialNumber: item?.manufacturerSerialNumber || item.productCode,
            themeList: item?.fromTheme ? JSON.parse(item?.fromTheme) : [],
            isDisabled: item?.isDisabled || false
          }
        })
      } else {
        // 工单
        flatQuoList = cloneDeep(serviceWorkOrders) || []
        infoCollectionList.value = flatQuoList.map((item) => {
          return {
            ...omit(item, ['id']), // 省去工单id
            id: null, // 工单id置空
            extraFilesLst: item.extraFilesLst || [], // extraFilesLst为空时会报错
            children: item.quotationMaterials || [{}],
            salesOrder: item.saleOrder, // 服务单、序列号是salesOrder，报价单是saleOrder
            manufacturerSerialNumber: item?.manufacturerSerialNumber || item.productCode,
            themeList: item?.fromTheme ? JSON.parse(item?.fromTheme) : [],
            isDisabled: item?.isDisabled || false,
            serviceWorkOrderId: item?.id, // 保存工单信息
            serviceWorkOrders: item // 保存工单信息
          }
        })
      }
    }
  },
  { deep: true, immediate: true }
)
function handleSerialNumberClick(row: any) {
  console.log(row)
}
function handleThemeClick($event: any, index: any, row: any) {
  console.log($event, index, row)
}
function handleEdit() {}
function handleThemeItemClick(themeItem: any) {
  console.log(themeItem)
}
function handleRightClick(themeItem: any) {
  console.log(themeItem)
}
function handleOptionChange(row: any) {
  console.log(row)
}
function handleDeleteTheme(row: any, themeIndex: any) {
  console.log(row, themeIndex)
}
function handleInfoChange() {}
function showDeleteIcon(row: any, index: any): boolean {
  console.log(row, index)
  return false
}
function handleInfoDelete(index: any) {
  console.log(index)
}
</script>
<style lang="scss" scoped>
:deep(.el-collapse-item) {
  margin-left: 15px !important;
  .el-collapse-item__wrap {
    margin-left: 15px !important;
  }
}
</style>
