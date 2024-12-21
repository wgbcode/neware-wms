<template>
  <div>
    <el-drawer v-model="drawer" :with-header="false" class="wrapper c-flex-column" @closed="updateRowData">
      <section class="c-flex">
        <div class="c-flex-center c-w40 c-h40 c-fs20 c-br50p c-no-select" style="background-color: var(--tc-global-blue)">
          {{ curUserName.charAt(0) }}
        </div>
        <div class="c-w100p c-ml10">
          <el-input
            :class="{ 'red-border-textarea': redBorderTextarea }"
            v-model="willAddRemark"
            style="width: 100%"
            :rows="3"
            type="textarea"
            placeholder="请输入单据备注"
            @focus="redBorderTextarea = false"
            :disabled="addRemarkDisabled"
          />
          <span v-show="redBorderTextarea" style="color: var(--tc-global-red)">评论内容不能为空</span>
          <div class="c-flex-between">
            <el-checkbox v-model="canFinishOrder" label="可清单" size="large" :disabled="checkboxDisabled" />
            <el-button type="primary" @click="addRemark" :loading="btnLoading">发表</el-button>
          </div>
        </div>
      </section>
      <section class="c-flex-1 c-overflow-y-auto c-mt20">
        <ul v-for="(item, index) in remarkData.remarkInfos" :key="index" class="c-mb15">
          <li class="c-flex">
            <div class="c-flex-center c-w30 c-h30 c-fs16 c-br50p c-no-select" style="background-color: var(--tc-global-blue)">
              {{ item.userName.charAt(0) }}
            </div>
            <div class="c-flex-column c-ml10" style="width: calc(100% - 40px)">
              <div class="c-flex c-mb5 c-w100p">
                <span style="color: var(--tc-primary-text)" class="c-mr10">{{ item.userName }}</span>
                <span style="color: var(--tc-label-text)">{{ dateFormat(item.createDate, 'YYYY.MM.DD HH:mm:ss') }}</span>
              </div>
              <div class="c-w100p" style="color: var(--tc-primary-text); word-wrap: break-word">
                {{ item.remark }}
              </div>
            </div>
          </li>
        </ul>
      </section>
    </el-drawer>
  </div>
</template>

<script setup lang="tsx">
import { ref, computed } from 'vue'
import { authStore } from '@/stores/auth'
import { dateFormat } from '@/utils/format'
import { GetSaleOrdrRemarks, AddSaleOrdrRemark } from '../js/request'
import { orderStatusMap } from '../js/map'

interface RowData {
  canInterRecon: number // 单据可清单状态
  hasRemark: boolean // 是否已添加有备注
  [key: string]: any // 行数据其它属性
}
interface RemarkData {
  docEntry: number
  canInterRecon: number
  remarkInfos: Array<{ remark: string; userId: string; userName: string; createDate: string }>
}
let initRowData: RowData[] | null = null
let initQueryOrder: QueryOrder[] | null = null
const emptyRemarkData = { docEntry: 0, remarkInfos: [], canInterRecon: 0 }
const drawer = ref<boolean>(false)
const willAddRemark = ref<string>('')
const canFinishOrder = ref<boolean>(false)
const btnLoading = ref<boolean>(false)
const remarkData = ref<RemarkData>({ ...emptyRemarkData })
const curUserName = ref<string>('')
const userRoles = ref<string[]>([])
const redBorderTextarea = ref<boolean>(false)
const addRemarkDisabled = computed(() => {
  return !userRoles.value.some((i) => ['风控', '法务', '财务', '超级管理员'].includes(i))
})
const checkboxDisabled = computed(() => {
  return (
    !userRoles.value.some((i) => ['财务', '超级管理员'].includes(i)) ||
    remarkData.value.canInterRecon === orderStatusMap.already ||
    !willAddRemark.value
  )
})
const canInterReconMap: Record<number, boolean> = {
  [orderStatusMap.cannot]: false, // 不可清单
  [orderStatusMap.can]: true, // 可清单
  [orderStatusMap.already]: true // 已清单
}
const newCanInterRecon = computed(() => {
  if (remarkData.value.canInterRecon === orderStatusMap.already) {
    return orderStatusMap.already
  }
  return canFinishOrder.value ? orderStatusMap.can : orderStatusMap.cannot
})
const addRemark = () => {
  if (willAddRemark.value) {
    btnLoading.value = true
    const params = { remark: willAddRemark.value, docEntrys: initQueryOrder, canInterRecon: newCanInterRecon.value }
    AddSaleOrdrRemark(params)
      .then((res) => {
        if (res.code === 200) {
          const createDate = dateFormat(new Date(), 'YYYY.MM.DD HH:mm:ss')
          remarkData.value.remarkInfos = [
            { remark: willAddRemark.value, userId: '', userName: curUserName.value, createDate },
            ...remarkData.value.remarkInfos
          ]
          willAddRemark.value = ''
        }
      })
      .finally(() => {
        btnLoading.value = false
      })
  } else {
    redBorderTextarea.value = true
  }
}
interface QueryOrder {
  sboId: number // 账套 id
  docEntry: number // 销售订单号
}
interface OpenParams {
  queryOrder: QueryOrder[] // 查询订单号（可能多个）
  rowData: RowData[] // 行数据集（可能多行，用于关闭抽屉时更新表格数据，不涉及到后端）
  isBatch?: boolean // 是否是批量请求
}
const openDrawer = async (params: OpenParams) => {
  willAddRemark.value = ''
  const { rowData, queryOrder, isBatch = false } = params
  initRowData = rowData
  initQueryOrder = queryOrder
  userRoles.value = authStore.userInfo?.roles as string[]
  curUserName.value = authStore.userInfo?.userName as string
  const { hasRemark, canInterRecon } = params.rowData[0]
  if (!hasRemark || isBatch) {
    remarkData.value = { ...emptyRemarkData }
    canFinishOrder.value = canInterReconMap[canInterRecon]
    drawer.value = true
  } else {
    // 查询没有批量
    const { sboId, docEntry } = queryOrder[0]
    await GetSaleOrdrRemarks({ docEntry, sboId }).then((res) => {
      const { code, result } = res
      if (code === 200) {
        remarkData.value = result
        canFinishOrder.value = canInterReconMap[result.canInterRecon]
        drawer.value = true
      }
    })
  }
}
// 关闭抽屉时更新表格行数据
const emit = defineEmits(['updateRowData'])
const updateRowData = () => {
  if (remarkData.value.remarkInfos.length > 0) {
    const newRowData = initRowData?.map((item) => {
      return { ...item, hasRemark: true, canInterRecon: newCanInterRecon.value }
    })
    emit('updateRowData', newRowData)
  }
}
defineExpose({ openDrawer })
</script>

<style scoped lang="scss">
:deep(.el-drawer__body) {
  display: flex;
  flex-direction: column;
}
.red-border-textarea :deep(.el-textarea__inner) {
  --el-input-border-color: var(--tc-global-red);
}
</style>
