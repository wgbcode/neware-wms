<template>
  <div class="quotation-info">
    <c-table v-model:data="tableData" :columnsConfig="columnsConfig" :tableConfig="tableConfig">
      <!-- 序列号 -->
      <template #manufacturerSerialNumber="row">
        <div class="serial-number-input" :class="{ disabled: row.isDisabled }" @click="handleSerialNumberClick(row)">
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
        <div class="form-theme-content" v-if="row.themeList && row.themeList.length" @click="handleThemeClick(index, row)">
          <el-scrollbar wrapClass="scroll-wrap-class">
            <div class="form-theme-list" :class="{ disabled: row.isDisabled }">
              <transition-group name="list" tag="ul">
                <li class="form-theme-item" v-for="(themeItem, themeIndex) in row.themeList" :key="themeItem.id">
                  <el-tooltip popper-class="form-theme-toolip" effect="dark" :content="themeItem.description" placement="top">
                    <p class="text">
                      <span> {{ themeItem.code || themeItem.description }}</span>
                      <span v-if="row.isDisabled && themeIndex != row.themeList.length - 1">{{ `,` }}</span>
                    </p>
                  </el-tooltip>
                  <i v-if="!row.isDisabled" class="icon-theme-close" @click.stop="handleDeleteTheme(row, themeIndex)"> </i>
                </li>
              </transition-group>
            </div>
          </el-scrollbar>
        </div>
      </template>
      <!-- 所需技能 -->
      <template #skill="row">
        <div>{{ row.skill }}</div>
      </template>
      <!-- 操作 -->
      <template #action="row">
        <!-- handlePushFormSerialNumber -->
        <div class="opration" :class="{ edit: (tableData.length > 1 && !row.isDisabled) || !row.isDisabled }">
          <div class="pointer" @click="handleSerialNumberClick(row)">
            <img :src="iconFormAdd" alt="SVG Icon" />
          </div>
          <div class="pointer" @click="handleParentDelete(row)">
            <img :src="iconFormDelete" alt="SVG Icon" />
          </div>
        </div>
      </template>
      <!-- 子物料 -->
      <template #expand="{ row: parentRow }">
        <c-table v-if="parentRow && parentRow.quotationMaterials" :data="parentRow.quotationMaterials" :columnsConfig="materialColumnsConfig">
          <!-- 物料编码 -->
          <template #itemCode="row">
            <div style="display: flex; justify-content: space-between; align-items: center" :class="{ 'is-delete': row.isDelete }">
              <span :class="{ 'has-icon': row.replaceMaterialCode || row.newMaterialCode }">
                {{ row.materialCode }}
              </span>
              <img :src="iconMtrNew" alt="SVG Icon" v-if="row.replaceMaterialCode" />
              <img :src="iconMtrReplace" alt="SVG Icon" v-if="row.newMaterialCode" />
            </div>
          </template>
          <!-- 数量 -->
          <template #count="row">
            <div>{{ row.count }}</div>
          </template>
          <!-- 最大数量 -->
          <template #maxQuantity="row">
            <div>{{ row.maxQuantity }}</div>
          </template>
          <!-- 成本价 -->
          <template #unitPrice="row">
            <div>{{ row.unitPrice }}</div>
          </template>
          <!-- 成本小计 -->
          <template #costTotal="row">
            <div>{{ row.costTotal }}</div>
          </template>
          <!-- 推荐单价 -->
          <template #salesPrice="row">
            <div>{{ row.salesPrice }}</div>
          </template>
          <!-- 折扣(%) -->
          <template #discount="row">
            <div>{{ row.discount }}</div>
          </template>
          <!-- 销售单价 -->
          <template #discountPrices="row">
            <div>{{ row.discountPrices }}</div>
          </template>
          <!-- 销售小计 -->
          <template #totalPrice="row">
            <div>{{ row.totalPrice }}</div>
          </template>
          <!-- 退料数 -->
          <template #returnQuantity="row">
            <div>{{ row.returnQuantity }}</div>
          </template>
          <!-- 操作 -->
          <template #action="row">
            <div>{{ row.action }}</div>
          </template>
        </c-table>
      </template>
    </c-table>
  </div>
</template>

<script setup lang="tsx">
// vue
import { ref, shallowRef, watch, computed } from 'vue'
// utils
import { omit } from 'lodash-es'
// resource
import { quotationEditNodeList } from './resource'
import { iconProtected, iconOut, iconFormAdd, iconFormDelete, iconMtrNew, iconMtrReplace } from '@/views/serve/serviceDetail/resource'
const props = defineProps({
  currentNode: {
    type: Object,
    default: null
  },
  commonDetail: {
    type: Object,
    default: null
  },
  quotation: {
    type: Object,
    default: null
  },
  quotationListOriginal: {
    type: Array,
    default: () => []
  }
})
// icons

const tableData = shallowRef<any[]>([{ quotationMaterials: [{}] }])
const columnsConfig = shallowRef([
  { type: 'expand', width: 30 },
  { label: '#', type: 'index', prop: '', width: 30 },
  { label: '序列号', width: 140, prop: 'manufacturerSerialNumber', slotName: 'manufacturerSerialNumber', required: true },
  { label: '物料编码', prop: 'materialCode', width: 201 },
  { label: '物料描述', prop: 'materialDescription', width: 167 },
  { label: '呼叫主题', prop: 'themeList', slotName: 'themeList', width: 316, required: true },
  { label: '所需技能', prop: 'skill', width: 168, slotName: 'skill', required: true },
  { label: '操作', prop: 'action', width: 52, slotName: 'action' }
])
const materialColumnsConfig = shallowRef([
  { label: '', prop: 'empty', width: 60 },
  { label: '#', type: 'index', prop: '', width: 27 },
  { label: '物料编码', prop: 'itemCode', slotName: 'itemCode', width: 201 },
  { label: '物料描述', prop: 'materialDescription', width: 167 },
  { label: '数量', prop: 'count', slotName: 'count', align: 'right', width: 55 },
  { label: '最大数量', prop: 'maxQuantity', slotName: 'maxQuantity', align: 'right', width: 74 },
  { label: '成本价', prop: 'unitPrice', slotName: 'unitPrice', align: 'right', width: 100 },
  { label: '成本小计', prop: 'costTotal', slotName: 'costTotal', align: 'right', width: 100 },
  { label: '推荐单价', prop: 'salesPrice', slotName: 'salesPrice', align: 'right', width: 100 },
  { label: '折扣(%)', prop: 'discount', slotName: 'discount', align: 'right', width: 70 },
  { label: '销售单价', prop: 'discountPrices', slotName: 'discountPrices', align: 'right', width: 100 },
  { label: '销售小计', prop: 'totalPrice', slotName: 'totalPrice', align: 'right', width: 100 },
  { label: '操作', prop: 'action', slotName: 'action', width: 52 }
])
const tableConfig = { 'default-expand-all': true }
const salesOrderId = ref(null) // 销售单号
const filesList = ref([]) // 附件列表
// 监听报价单数据
const flowChange = computed(() => {
  return { currentNode: props.currentNode, quotation: props.quotation }
})
watch(
  flowChange,
  (value) => {
    // 判空返回
    if (!value.currentNode.activityName || !value.quotation) {
      return
    }
    const { quotation, serviceWorkOrders } = value.quotation
    const { activityName } = value.currentNode
    // 报价单
    if (quotation && quotation?.quotationProducts.length > 0) {
      initQuotation(quotation)
    }
    console.log(serviceWorkOrders, activityName)
  },
  { deep: true, immediate: true }
)
// 加载报价单数据
function initQuotation(quotation: AnyObject) {
  let { activityName } = props.currentNode
  // 报价单
  let { quotationProducts = [], fileIdLst = [], isDataDesensitization = false } = quotation
  // 报价单开票单位等信息校验
  // for (const field of fieldsToCopy) {
  //   this.ruleForm[field] = quotation[field]
  // }
  salesOrderId.value = quotation.salesOrderId
  // 保存文件(合同)
  filesList.value =
    fileIdLst?.map((item: AnyObject) => {
      return {
        id: item.id,
        fileType: item.type
      }
    }) || []
  let listTmp: AnyObject[] = []
  quotationProducts.forEach((product: AnyObject) => {
    // 子列表物料
    const quotationMaterials = product.quotationMaterials?.map((materials: AnyObject) => {
      const unitPrice = materials?.unitPrice || 0
      const count = materials?.count || 0
      const outputQuantity = materials?.sentQuantity || 0
      const returnQuantity = materials?.rnm?.length || 0
      const costTotal = unitPrice * count || 0
      const waitingOutbound = materials?.quoMegerMaterialStatus === -1 // 待出库
      return {
        ...materials,
        outputQuantity,
        returnQuantity,
        unitPrice,
        costTotal,
        salesPrice: materials?.salesPrice,
        totalPrice: materials.materialType == '1' ? 0.0 : materials?.totalPrice,
        discountPrices: materials.materialType == '1' ? 0.0 : materials?.discountPrices,
        isDisabled: !quotationEditNodeList.includes(activityName), // 非工程部可编辑节点
        isProductOld: materials.isProductOld, // 旧报价单
        isCleared: materials.quoMegerMaterialStatus === 1, // 3.0已清
        waitingOutbound, // 待出库
        minCount: waitingOutbound ? count : 0.001,
        isDataDesensitization // 敏感信息
      }
    })
    // 呼叫主题
    let themeList = []
    if (product?.serviceWorkOrders?.fromTheme) {
      themeList = JSON.parse(product?.serviceWorkOrders?.fromTheme)
    } else if (product?.fromTheme) {
      themeList = JSON.parse(product?.fromTheme)
    }
    // 合同附件
    const fileId = fileIdLst[0]?.id
    // 合并产品数据
    const serialNumberItem: AnyObject = {
      ...product,
      ...omit(product?.serviceWorkOrders, ['id']),
      fileId: fileId, // 合同附件
      // 工程部可编辑节点与后台的isDisabled结合/旧报价单
      isDisabled: !quotationEditNodeList.includes(activityName) || product.isOld,
      manufacturerSerialNumber: product.productCode,
      themeList: themeList,
      quotationMaterials: quotationMaterials || [{}] // 产品下的物料
    }
    listTmp.push(serialNumberItem)
  })
  // 赋值
  tableData.value = listTmp
}
// 添加序列号
function handleSerialNumberClick(row: AnyObject) {
  console.log(row)
}
// 添加呼叫主题
function handleThemeClick(index: number, row: AnyObject) {
  console.log(index, row)
}
// 删除呼叫主题
function handleDeleteTheme(row: AnyObject, themeIndex: number) {
  console.log(row, themeIndex)
}
// 删除序列号行
function handleParentDelete(row: AnyObject) {
  console.log(row)
}
</script>
<style lang="scss" scoped>
// 子表格撑开
:deep(.el-table__expanded-cell) {
  display: block;
  width: 1600px;
  padding: 0;
}
</style>
