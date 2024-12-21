<template>
  <div class="service-detail erp-common">
    <el-dialog
      class="service-detail-dialog"
      v-model="serviceDetailVisible"
      :append-to-body="false"
      :close-on-click-modal="false"
      title="服务单详情"
      top="0"
      width="100%"
    >
      <div>
        <TopInfo :commonDetail="commonDetail" :currentNode="currentNode" :customerDetail="customerDetail"></TopInfo>
      </div>
      <el-collapse v-model="activeNames">
        <el-collapse-item id="section1" name="1">
          <template #title>
            <div class="collapse-title"><span>基本信息</span></div>
          </template>
          <CustomerInfo v-if="false" v-loading="customerLoading"></CustomerInfo>
        </el-collapse-item>
        <el-collapse-item id="section2" name="2">
          <template #title>
            <div class="collapse-title"><span>服务需求单</span></div>
          </template>
          <ServiceDemand v-loading="demandLoading" :quotation="quotationMerge"></ServiceDemand>
        </el-collapse-item>
        <el-collapse-item id="section3" name="3">
          <template #title>
            <div class="collapse-title"><span>销售订单</span></div>
          </template>
          <QuotationInfo
            v-loading="quotationLoading"
            :currentNode="currentNode"
            :quotation="quotationMerge"
            :quotationListOriginal="quotationListOriginal"
          ></QuotationInfo>
        </el-collapse-item>
        <el-collapse-item id="section4" name="4">
          <template #title>
            <div class="collapse-title"><span>服务采购单</span></div>
          </template>
          <div>test</div>
        </el-collapse-item>
        <el-collapse-item id="section5" name="5">
          <template #title>
            <div class="collapse-title"><span>服务订单交付</span></div>
          </template>
          <outboundOrder></outboundOrder>
        </el-collapse-item>
        <el-collapse-item id="section6" name="6">
          <template #title>
            <div class="collapse-title"><span>服务单工作记录</span></div>
          </template>
          <div>test</div>
        </el-collapse-item>
        <el-collapse-item id="section7" name="7">
          <template #title>
            <div class="collapse-title"><span>回访记录</span></div>
          </template>
          <div>test</div>
        </el-collapse-item>
        <el-collapse-item id="section8" name="8">
          <template #title>
            <div class="collapse-title"><span>操作记录</span></div>
          </template>
          <OperationRecord
            v-loading="operLoading"
            :operationHistory="operationHistory"
            :commonDetail="commonDetail"
            :currentNode="currentNode"
          ></OperationRecord>
        </el-collapse-item>
      </el-collapse>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="serviceDetailVisible = false">取消</el-button>
          <el-button type="primary" @click="serviceDetailVisible = false">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx">
// vue
import { shallowRef, ref } from 'vue'
import CustomerInfo from './components/customerInfo/index.vue'
import ServiceDemand from './components/serviceDemand/index.vue'
import QuotationInfo from './components/quotationInfo/index.vue'
import outboundOrder from './components/outboundOrder.vue'
import OperationRecord from './components/operationRecord.vue'
import TopInfo from './components/topInfo/index.vue'
// hooks
import ServiceFlow from './hooks/flow'
import ServiceQuotation from './hooks/quotation'
// API
import * as serviceApi from './request'
// resource
import type { openDetailParam, currentNodeStructure } from '@/views/serve/serviceDetail/serviceDetailTypes'

// 弹窗
const serviceDetailVisible = shallowRef(false)
// loading
const customerLoading = shallowRef<boolean>(false)
const demandLoading = shallowRef<boolean>(false)
const quotationLoading = shallowRef<boolean>(false)
const operLoading = shallowRef<boolean>(false)
// data
const commonDetail = ref<AnyObject>({}) // 服务单详情数据（核心）
const customerDetail = ref<AnyObject>({}) // 客户详情数据
const activeNames = shallowRef(['1', '2', '3', '8']) // 折叠
const serviceOrderId = shallowRef<string | number | null>(null) // 服务单id
const serviceOrderSapId = shallowRef<string | number | null>(null) // 服务单sapid
const flowInstanceId = shallowRef<string | null>(null) // 流程实例id
const quotationMerge = shallowRef<AnyObject>({ quotation: null, serviceWorkOrders: [] }) // 合并报价单
const quotationListOriginal = ref<AnyObject[]>([]) // 报价单原始数据（相当于备份）
const operationHistory = shallowRef<AnyObject[]>([]) // 操作记录
// 当前流程节点
const currentNode = shallowRef<currentNodeStructure>({ activityName: '', number: 0 })
// 方法
const open = (value: openDetailParam) => {
  serviceDetailVisible.value = true
  if (value.pageType == 'Add') {
    console.log('新增')
  } else {
    if (value.serviceId && value.sapId) {
      loadData(value)
    }
  }
}
// 关闭弹窗
const close = () => {
  serviceDetailVisible.value = false
}
// 暴露方法
defineExpose({
  open,
  close
})
// 加载数据
async function loadData(value: openDetailParam) {
  const { serviceId, sapId, flowId } = value
  serviceOrderId.value = serviceId
  serviceOrderSapId.value = sapId
  quotationLoading.value = true
  demandLoading.value = true
  operLoading.value = true
  // 获得服务单与报价单信息
  const sParam = { id: value.serviceId }
  const qParam = { serviceOrderId: value.serviceId }
  const [serviceRes, quotaitonRes] = await Promise.all([serviceApi.getServiceDetails(sParam), serviceApi.getQuotationDetails(qParam)])
  console.log('获得服务单与报价单信息', serviceRes, quotaitonRes)
  // 获取流程实例
  flowInstanceId.value = flowId || serviceRes.result.flowInstanceId
  if (flowInstanceId.value) {
    const flowRes = await ServiceFlow(flowInstanceId.value)
    currentNode.value = flowRes.currentNode.value || { activityName: '1.0服务需求单', number: 0 } // 当前节点
    operationHistory.value = flowRes.operationHistory.value // 操作记录
  }
  operLoading.value = false
  // 合并报价
  const quotaitonResData = quotaitonRes?.data
  let serviceQuotation = null
  if (quotaitonResData) {
    serviceQuotation = ServiceQuotation(quotaitonResData)
    quotationMerge.value = serviceQuotation?.quotationMerge.value
    quotationListOriginal.value = serviceQuotation?.quotationListOriginal.value as AnyObject[]
  }
  demandLoading.value = false
  quotationLoading.value = false
  // 服务单详情
  commonDetail.value = Object.assign(serviceRes?.result, serviceQuotation?.invoiceInfo) // 合并对象(服务单详情 + 发票信息)
  // 客户详情
  getCustomerDetail(serviceRes)
  // 其他数据
  // this.isDataDesensitization = quotaitonResData.quotation.some((item) => item?.isDataDesensitization) // 敏感信息
  // this.isExpress = this.quotationListOriginal?.length > 0 && this.quotationListOriginal.some((item) => item.isExpress) // 物流信息
  // this.quotationIdList = quotaitonResData.quotation?.filter((item) => item.id)?.map((inner) => inner.id) || [] // 报价单列表 出库单用
  // this.providedData.servciePurchaseInfo = quotaitonResData.servciePurchaseInfo || {} // 取服务采购单里面的信息
}
// 客户详情
async function getCustomerDetail(serviceRes: AnyObject) {
  let detail = null
  try {
    const customerCode = serviceRes.result.terminalCustomerId || serviceRes.result.customerId
    const res = await serviceApi.getCardInfoForServe({ cardCode: customerCode })
    if (res.code == 200) {
      detail = res.result
    } else {
      throw new Error(res.message)
    }
  } catch (err) {
    console.log(err)
  }
  customerDetail.value = {
    customerId: serviceRes.result.customerId,
    terminalCustomerId: serviceRes.result.terminalCustomerId,
    terminalCustomer: serviceRes.result.terminalCustomer,
    cardInfo: detail // 客户详情
  }
}
</script>
<style lang="scss" scoped>
.service-detail > :deep(div) {
  position: absolute !important;
  .el-overlay-dialog {
    position: absolute;
  }
  .service-detail-dialog {
    height: 100%;
    margin: 0;
    .el-dialog__body {
      height: calc(100% - 60px);
      overflow: auto;
      background: var(--tc-mostbottom);
      padding: 0;
    }
  }
}
</style>
