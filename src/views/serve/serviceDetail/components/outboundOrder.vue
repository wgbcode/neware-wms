<template>
  <div>
    <my-dialog ref="dialog" title="服务出库单" :append-to-body="true" width="1215px">
      <div v-for="(item, index) in tableData" :key="index" style="margin-bottom: 12px" class="form-table">
        <div class="table-info">
          <div class="item">
            <span class="item-label">销售订单:</span>
            <span class="item-value" style="margin-left: 2px">{{ item.salesOrderId ? `SE-${item.salesOrderId}` : '' }}</span>
          </div>
        </div>
        <common-table
          ref="commonTable"
          :data="item.list"
          :default-expand-all="true"
          :columns="tableColumns"
          :loading="tableLoading"
          selectedKey="mergeMaterialId"
          :selectedList="item.selectedList"
          :row-key="item.mergeMaterialId"
          @selection-change="handleSelectionChange($event, item.key, item)"
        >
          <template #materialType="{ row }">
            <span>{{ getMaterialType(row) }}</span>
          </template>
          <template #itemQty="{ row }">
            <el-input-number
              size="small"
              :controls="false"
              v-model="row.itemQty"
              :precision="2"
              :max="row.waitOutQty"
              :min="0.01"
              v-if="row.waitOutQty > 0"
            ></el-input-number>
          </template>
          <template #deliverOrderSapIds="{ row }">
            <link-cell
              style="width: 100%; justify-content: space-between"
              :text="
                row.deliverOrderSapIds.length > 1 ? `${row.deliverOrderSapIds[0]} (${row.deliverOrderSapIds.length})` : row.deliverOrderSapIds[0]
              "
              @click="fetchDeliverysIncludeItems(row)"
            ></link-cell>
          </template>
          <template v-slot:globalApprovalHeader="{ label }">
            <div style="display: flex; align-items: center; justify-content: flex-end">
              <span>{{ label }}</span>
              <el-tooltip effect="dark" placement="top-end" content="同服务出库单号">
                <div>
                  <img :src="iconQuestion" alt="SVG Icon" style="display: block" />
                </div>
              </el-tooltip>
            </div>
          </template>
          <template #globalApprovalIds="{ row }">
            <link-cell
              style="width: 100%; justify-content: space-between"
              :text="row.globalApprovalIds.length > 1 ? `${row.globalApprovalIds[0]} (${row.globalApprovalIds.length})` : row.globalApprovalIds[0]"
              @click="fetchDeliverysIncludeItems(row)"
            ></link-cell>
          </template>
        </common-table>
      </div>
      <div class="table-button">
        <el-button type="default" size="small" @click="handleGenerateOrder" :loading="loadingBtn" v-if="isTechnician">生成服务出库单</el-button>
      </div>
    </my-dialog>
    <my-dialog ref="outboundOrders" title="出库单列表" :append-to-body="true" width="580px">
      <div v-for="(item, index) in outboundOrdersList" :key="index" style="margin-bottom: 12px">
        <div style="display: flex">
          <div class="item" style="margin-right: 12px">
            <span class="item-label">交货时间:</span>
            <span class="item-value">{{ item.deliveryTime || '--' }}</span>
          </div>
          <div class="item" style="margin-right: 12px">
            <span class="item-label">交货单号:</span>
            <span class="item-value">{{ item.deliverOrderSapId ? `PL-${item.deliverOrderSapId}` : '--' }}</span>
          </div>
          <div class="item" style="margin-right: 12px">
            <span class="item-label">服务出库单号:</span>
            <span class="item-value">{{ item.globalApprovalId || '--' }}</span>
          </div>
        </div>
        <div class="form-table">
          <common-table :data="item.afterSalesDeliveryItems" :default-expand-all="true" :columns="miniColumns" :loading="tableLoading">
          </common-table>
        </div>
      </div>
    </my-dialog>
  </div>
</template>

<script setup lang="tsx">
import { shallowRef } from 'vue'
import { isMatchRole } from '@/utils/auth'
import { iconQuestion } from '@/views/serve/serviceDetail/resource'
const materialTypeEnum: { [key: number]: string } = {
  1: '更换',
  2: '购买',
  3: '赠送',
  4: '成本'
}
const tableData = shallowRef<AnyObject[]>([])
const tableColumns = shallowRef<AnyObject[]>([
  { type: 'selection', width: 30 },
  { label: '#', type: 'index', prop: '', width: 30 },
  { label: '领料类型', prop: 'materialType', width: 60, slotName: 'materialType' },
  { label: '物料编码', prop: 'materialCode', width: 201 },
  { label: '物料描述', prop: 'materialDescription', width: 167 },
  { label: '单位', prop: 'unit', width: 50 },
  { label: '总数量', prop: 'totalQty', width: 50, align: 'right' },
  { label: '已出数量', prop: 'outTotalQty', width: 100, align: 'right' },
  { label: '待出库数量', prop: 'itemQty', width: 120, slotName: 'itemQty', align: 'right' },
  { label: '交货单号', prop: 'deliverOrderSapIds', width: 80, align: 'right', slotName: 'deliverOrderSapIds' },
  { label: '应收发票号', prop: 'invoiceDocEntry', width: 80, align: 'right' },
  {
    label: '审批序号',
    prop: 'globalApprovalIds',
    width: 100,
    align: 'right',
    slotName: 'globalApprovalIds',
    headerName: 'globalApprovalHeader',
    isCustomizeHeader: true
  },
  { label: '发起出库时间', prop: 'createTime', width: 124, align: 'right' }
])
const miniColumns = shallowRef<AnyObject[]>([
  { label: '#', type: 'index', prop: '', width: 30 },
  { label: '物料编码', prop: 'materialCode', width: 201 },
  { label: '物料描述', prop: 'materialDescription', width: 167 },
  { label: '单位', prop: 'unit', width: 50 },
  { label: '已出数量', prop: 'itemQty', width: 100, align: 'right' }
])
const outboundOrdersList = shallowRef<AnyObject[]>([])

const tableLoading = shallowRef<boolean>(false)
const loadingBtn = shallowRef<boolean>(false)
const isTechnician = shallowRef<boolean>(isMatchRole('售后技术员'))
function getMaterialType(row: AnyObject) {
  if (row.materialType && materialTypeEnum[row.materialType]) {
    return materialTypeEnum[row.materialType]
  } else {
    return ''
  }
}
function handleSelectionChange($event: AnyObject, key: AnyObject, item: AnyObject) {
  console.log($event, key, item)
}
function fetchDeliverysIncludeItems(row: AnyObject) {
  console.log(row)
}
function handleGenerateOrder(row: AnyObject) {
  console.log(row)
}
</script>
<style lang="scss" scoped>
.table-info {
  display: flex;
  align-items: center;
  padding: 8px 0px;
}

.table-button {
  width: 100%;
  display: flex;
  justify-content: center;
}

.form-table {
  :deep(.el-input-number) {
    width: 100%;
    line-height: initial;
  }
}
</style>
