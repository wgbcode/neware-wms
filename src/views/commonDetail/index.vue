<template>
  <div class="c-relative c-h100p c-w100p">
    <CustomerReceivableDetail ref="customerReceivableDetail" @closeIframe="closeIframeHandler" />
  </div>
</template>

<script setup lang="tsx">
import { useTemplateRef, onMounted } from 'vue'
import CustomerReceivableDetail from '@/views/finance/customerReceivable/components/Detail.vue'
import { useMessage, afterMessageConnect, messageInfo, postMessage } from '@/hooks/useMessage'
import { keepAliveOption } from '@/utils/generateRoutes'

interface Params {
  type: 'customerReceivableDetail'
  cardCode: string
}

// keep-alive
defineOptions({ name: keepAliveOption.commonDetail })

// postMessage
useMessage('commonDetail')

let queryParams: Partial<Params> = {}
const closeIframeHandler = () => postMessage('closeIframe')
const customerReceivableDetail = useTemplateRef<DialogInstance>('customerReceivableDetail')
onMounted(() => {
  afterMessageConnect(() => {
    if (messageInfo) {
      const { data } = messageInfo
      const { type } = data
      queryParams = data
      const callback = new Map([[type === 'customerReceivableDetail', openCustomerReceivableDetail]]).get(true)
      callback && callback()
    }
  })
})
function openCustomerReceivableDetail() {
  const { cardCode } = queryParams
  customerReceivableDetail.value!.openDialog({ cardCode })
}
</script>

<style scoped lang="scss"></style>
