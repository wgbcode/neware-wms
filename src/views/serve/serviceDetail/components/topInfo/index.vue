<template>
  <div class="top-nav">
    <div class="info-wrapper">
      <div class="info-panel">
        <div class="left">
          <div class="block item">
            <span class="item-label"> 审批序号: </span>
            <span class="item-value">{{ topInfo.globalApprovalId }}</span>
          </div>
        </div>
      </div>
      <div class="info-panel invoice"></div>
    </div>
    <div>{{ balance }}</div>
    <div>{{ serviceTechNum }}</div>
  </div>
</template>

<script setup lang="tsx">
import { ref, shallowRef, watch } from 'vue'
import { numberFormat } from '@/utils/format'
const props = defineProps({
  currentNode: {
    type: Object,
    default: null
  },
  commonDetail: {
    type: Object,
    default: null
  },
  customerDetail: {
    type: Object,
    default: null
  }
})
const topInfo = ref<AnyObject>({
  globalApprovalId: '',
  salesMan: '',
  serviceWorkOrders: [],
  recepUserName: '',
  supervisor: '',
  newestContacter: '',
  newestContactTel: '',
  logisticsMethod: '',
  shippingAddress: '',
  province: '',
  city: '',
  area: '',
  addr: ''
})
const balance = shallowRef<number | string>(0) // 科目余额
const serviceTechNum = shallowRef<number>(0) // 服务单技术员数量
watch(
  () => props.commonDetail,
  (val) => {
    topInfo.value = val
  },
  { deep: true }
)
watch(
  () => props.customerDetail,
  (value) => {
    if (value?.cardInfo) {
      const val = value.cardInfo
      serviceTechNum.value = val?.serviceTechNum
      // 科目余额
      if (val?.balance) {
        balance.value = numberFormat(val.balance)
      } else {
        balance.value = '暂无数据'
      }
    }
  },
  { deep: true }
)
</script>
<style lang="scss" scoped></style>
