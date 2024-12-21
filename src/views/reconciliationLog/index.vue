<template>
  <div class="c-relative" style="height: 100%">
    <div class="c-flex-column c-h100p">
      <c-search v-model:data="queryList" :config="searchConfig" class="header-search">
        <el-button
          v-permission:approve
          @click="
            () => {
              toOperate(1)
            }
          "
          type="primary"
          size="small"
        >
          批准
        </el-button>
        <el-button
          v-permission:reject
          @click="
            () => {
              toOperate(2)
            }
          "
          type="primary"
          size="small"
        >
          驳回
        </el-button>
      </c-search>

      <div class="c-flex c-flex-1 c-overflow-hidden c-flex-column">
        <div class="table-container">
          <el-table
            :data="transformedData"
            style="width: 100%; height: 100%"
            :span-method="objectSpanMethod"
            border
            :header-cell-class-name="headerCellClassName"
            :cell-class-name="cellClassName"
          >
            <el-table-column label="#" width="50" align="center" prop="indexs">
              <template #default="{ row }">
                <input type="checkbox" v-model="row.isChecked" />
              </template>
            </el-table-column>
            <el-table-column
              label="对账序号"
              prop="reconciliationSerialNum"
              width="100px"
              show-overflow-tooltip
              align="left"
              resizeble
            ></el-table-column>
            <el-table-column label="对账金额" prop="reconAmount" width="90px" show-overflow-tooltip align="right" resizeble>
              <template #default="{ row }">
                <span>{{ toFormatInOrOutAmount(row.reconAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="银行流水" prop="bankFlows" width="400px" header-align="center" class="banksflows-column-class" resizeble>
              <template #header>
                <div class="nested-header" style="display: flex; flex-direction: column">
                  <div class="bank-flow">银行流水</div>
                  <div class="bank-flow-item">
                    <div style="text-align: right; width: 20%">进/出帐金额</div>
                    <div style="text-align: left; width: 20%">标识</div>
                    <div style="text-align: left; width: 60%">摘要</div>
                  </div>
                </div>
              </template>
              <template #default="{ row }">
                <div class="bank-content">
                  <div v-for="(item, index) in row.bankFlows" :key="index" class="bank-content-item">
                    <div class="bank-item" style="text-align: right; width: 25%">
                      <span>{{ toFormatInOrOutAmount(item.inOutAmount) }}</span>
                    </div>
                    <el-tooltip :content="item.indicator" placement="top">
                      <div class="bank-item bank-text" style="display: block; width: 15%" @mouseenter="hoverItem">{{ item.indicator }}</div>
                    </el-tooltip>
                    <el-tooltip :content="item.remark" placement="top">
                      <div class="bank-item bank-text" style="display: block; width: 60%" @mouseenter="hoverItem">{{ item.remark }}</div>
                    </el-tooltip>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="关联单据" prop="associatedDoc" width="100px" show-overflow-tooltip align="left" resizeble> </el-table-column>
            <el-table-column label="单据金额" prop="documentAmount" width="90px" show-overflow-tooltip align="right" resizeble>
              <template #default="{ row }">
                <span>{{ toFormatInOrOutAmount(row.documentAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" width="120px" show-overflow-tooltip resizeble> </el-table-column>
            <el-table-column label="日记账明细" prop="amountDetail" header-align="center" resizeble>
              <el-table-column label="科目号" prop="code" width="90px" show-overflow-tooltip align="left" resizeble></el-table-column>
              <el-table-column label="科目名称" prop="name" width="150px" show-overflow-tooltip resizeble></el-table-column>
              <el-table-column label="借方发生额" prop="creditAmount" width="90px" show-overflow-tooltip align="right" resizeble>
                <template #default="{ row }">
                  <span>{{ toFormatInOrOutAmount(row.debitAmount) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="贷方发生额" prop="debitAmount" width="90px" show-overflow-tooltip align="right" resizeble>
                <template #default="{ row }">
                  <span>{{ toFormatInOrOutAmount(row.creditAmount) }}</span>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="状态" prop="statusName" width="60px" resizeble></el-table-column>
          </el-table>
        </div>
        <div class="pagination"><c-footer v-model:data="footerData" :options="footerOptions" @update="onSearch" /></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="tsx">
import { shallowRef, computed, onMounted, ref } from 'vue'
import { GetReconcliationLogList, approveApi, rejectApi } from './request'
import { GetJournalAcctList } from '@/views/finance/bankStatements/request'
import { numberFormat2, type NumberFormat2 } from '@/utils/format'

import type { AcctList } from '@/views/finance/bankStatements/types'
import type { RowData } from './types'
import { ElMessage } from 'element-plus'

onMounted(() => {
  addSeparator() //金额之间添加'-'符号
  GetJournalAcctLists()
  getTableList()
})
const totalCount = shallowRef<number>(0)
const footerData = shallowRef<FooterData>({ page: 1, limit: 200 })

const tableData = shallowRef<RowData[]>()
const queryList = shallowRef<QueryList>({})

const inOutAmountList: SelectList[] = [
  { label: '收款', value: '1' },
  { label: '付款', value: '0' }
]
const statusList: SelectList[] = [
  { label: '未决', value: '0' },
  { label: '确认', value: '10' },
  { label: '驳回', value: '20' }
]
const totalAccountList = shallowRef<AcctList[]>([])
const searchConfig = computed(() => {
  return [
    { name: 'select', prop: 'QryType', attr: { optionV2: statusList, placeholder: '状态', multiple: true } },
    {
      name: 'select',
      prop: 'LedgerAccountCode',
      attr: { optionV2: totalAccountList, placeholder: '总账科目', filter: true },
      style: { width: '180px' }
    },
    { name: 'select', prop: 'ReconType', attr: { optionV2: inOutAmountList, placeholder: '收/付款' } },
    { name: 'input', prop: 'CardCode', attr: { placeholder: '业务伙伴' } },
    { name: 'input', prop: 'AmountDownLimit', attr: { placeholder: '金额', type: 'number' } },
    { name: 'input', prop: 'AmountUpLimit', attr: { placeholder: '金额', type: 'number' } },
    { name: 'button', text: '查询', attr: { type: 'primary' }, on: { click: onSearch } }
    // {
    //   name: 'button',
    //   text: '批准',
    //   attr: { type: 'primary' },
    //   on: { click: () => toOperate(1) },
    //   usePermission: 'approve'
    // },
    // { name: 'button', text: '驳回', attr: { type: 'primary' }, on: { click: () => toOperate(2) }, usePermission: 'reject' }
  ]
})
const showTooltip = ref(false)
const hoverItem = (e: MouseEvent) => {
  const el = e.target as HTMLElement
  if (el) {
    showTooltip.value = !(el.offsetWidth < el.scrollWidth)
  }
}
const headerCellClassName = ({ column }: any) => {
  if (column.property === 'bankFlows') {
    // 给银行流水列表头和表体单元格添加类名，去掉padding
    return 'banksflows-column-class'
  } else if (
    column.property === 'reconciliationSerialNum' ||
    column.property === 'reconAmount' ||
    column.property === 'associatedDoc' ||
    column.property === 'documentAmount' ||
    column.property === 'remark' ||
    column.property === 'statusName'
  ) {
    return 'header-position'
  } else {
    return ''
  }
}
const cellClassName = ({ column }: any) => {
  if (column.property === 'bankFlows') {
    // 给银行流水列表头和表体单元格添加类名，去掉padding
    return 'banksflows-column-class'
  } else {
    return ''
  }
}
const toFormatInOrOutAmount = (money: number) => {
  // 格式化金额
  let value = numberFormat2({
    value: money,
    isInteger: false,
    min: 2,
    max: 2
  } as NumberFormat2)
  value = Number(value) === 0 ? '' : value
  return value
}

const footerOptions = computed<FooterOptions>(() => {
  return {
    baseOption: { totalCount: totalCount.value },
    compOption: [{ name: 'pagination' }]
  }
})
const addSeparator = () => {
  const headerSearchElements = document.querySelectorAll('.header-search')
  // 遍历每个 .header-search 元素
  headerSearchElements.forEach((headerSearch) => {
    // 获取该元素下的所有子节点
    const childNodes = headerSearch.children
    // 确保至少有五个子节点
    if (childNodes.length >= 5) {
      // 创建一个新的 div 元素
      const newDiv = document.createElement('div')
      // 设置新 div 的内容
      newDiv.textContent = '-'
      // 设置 margin-right 为 5px  padding-bottom 为 6px,保证与其他条件对其
      newDiv.style.marginRight = '5px'
      newDiv.style.paddingBottom = '6px'
      // 获取第五个子节点后面的节点
      const fifthChild = childNodes[4] // 索引从0开始，5th子节点是index 4
      // 在第五个子节点后面插入新 div
      fifthChild.insertAdjacentElement('afterend', newDiv)
    }
  })
}
const toOperate = (type: number) => {
  const arr = (transformedData.value || []).filter((i: RowData) => i.isChecked).map((item: RowData) => item.reconciliationSerialNum)
  if (arr.length === 0) {
    ElMessage({ type: 'warning', message: '请至少选择一条数据' })
    return
  }
  let params = {
    CheckSeqNums: arr
  }
  if (type === 1) {
    goApprove(params)
  } else {
    goReject(params)
  }
}
const goApprove = (params: Object) => {
  approveApi(params)
    .then(() => {
      footerData.value.page = 1
      footerData.value.limit = 200
      queryList.value = {}
      ElMessage({ type: 'success', message: '审批成功' })
      getTableList()
    })
    .catch(() => {
      ElMessage({ type: 'error', message: '审批失败' })
    })
}
const goReject = (params: Object) => {
  rejectApi(params)
    .then(() => {
      footerData.value.page = 1
      footerData.value.limit = 200
      queryList.value = {}
      ElMessage({ type: 'success', message: '驳回成功' })
      getTableList()
    })
    .catch(() => {
      ElMessage({ type: 'error', message: '驳回失败' })
    })
}
const onSearch = () => {
  getTableList()
}

const getTableList = () => {
  let params = {
    QryType: queryList.value.QryType,
    LedgerAccountCode: queryList.value.LedgerAccountCode,
    ReconType: queryList.value.ReconType,
    CardCode: queryList.value.CardCode,
    AmountUpLimit: queryList.value.AmountUpLimit,
    AmountDownLimit: queryList.value.AmountDownLimit,
    limit: footerData.value.limit,
    page: footerData.value.page
  }
  GetReconcliationLogList(params)
    .then((res: { data: never[]; count: number }) => {
      tableData.value = (res.data || []).map((item: any) => {
        if (typeof item === 'object' && item !== null) {
          return { ...item, isChecked: false }
        }
        return { isChecked: false }
      })
      totalCount.value = res.count || 0
    })
    .catch((error: any) => {
      ElMessage({ type: 'error', message: error })
    })
}
// 总账科目下拉列表
const GetJournalAcctLists = () => {
  GetJournalAcctList().then((res: any) => {
    totalAccountList.value = res.data.map((item: any) => {
      return { ...item, label: item.acctCode + '-' + item.acctName, value: item.acctCode }
    })
  })
}

const transformData = (originalData: RowData[]): RowData[] => {
  let transformDataArr: RowData[] = []
  originalData.forEach((item: any) => {
    if (item.reconDetails && item.reconDetails.length > 0) {
      item.reconDetails.forEach((detail: any) => {
        if (detail.journalDetails && detail.journalDetails.length > 0) {
          detail.journalDetails.forEach((amount: any) => {
            transformDataArr.push({
              ...item,
              ...detail,
              ...amount
            })
          })
        } else {
          transformDataArr.push({
            ...item,
            ...detail
          })
        }
      })
    } else {
      transformDataArr.push({
        ...item
      })
    }
  })
  return transformDataArr
}
const transformedData = computed(() => {
  const data = tableData.value || []
  return transformData(data)
})
/**
 *
 * 合并表格
 */

const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  //第一列、对账序号列、对账金额、银行流水列根据对账序列一样规则进行合并
  if (
    column.property === 'indexs' ||
    column.property === 'reconciliationSerialNum' ||
    column.property === 'reconAmount' ||
    columnIndex === 3 ||
    column.property === 'statusName'
  ) {
    // 获取当前单元格的值
    const currentValue = row['reconciliationSerialNum']

    // 获取上一行相同列的值
    const preRow = transformedData.value[rowIndex - 1]
    const preValue = preRow ? preRow['reconciliationSerialNum'] : null

    // 如果当前值和上一行的值相同，则将当前单元格隐藏
    if (currentValue === preValue) {
      return { rowspan: 0, colspan: 0 }
    } else {
      // 否则计算当前单元格应该跨越多少行
      let rowspan = 1
      for (let i = rowIndex + 1; i < transformedData.value.length; i++) {
        const nextRow = transformedData.value[i]
        const nextValue = nextRow['reconciliationSerialNum']
        if (nextValue === currentValue) {
          rowspan++
        } else {
          break
        }
      }
      return { rowspan, colspan: 1 }
    }
  }
  //关联单据、单据金额、备注列根据关联单据一样规则进行合并
  if (column.property === 'associatedDoc' || column.property === 'documentAmount' || column.property === 'remark') {
    // 获取当前单元格的值
    const currentValue = row['journal_id']

    // 获取上一行相同列的值
    const preRow = transformedData.value[rowIndex - 1]
    const preValue = preRow ? preRow['journal_id'] : null

    // 如果当前值和上一行的值相同，则将当前单元格隐藏
    if (currentValue === preValue) {
      return { rowspan: 0, colspan: 0 }
    } else {
      // 否则计算当前单元格应该跨越多少行
      let rowspan = 1
      for (let i = rowIndex + 1; i < transformedData.value.length; i++) {
        const nextRow = transformedData.value[i]
        const nextValue = nextRow['journal_id']
        if (nextValue === currentValue) {
          rowspan++
        } else {
          break
        }
      }
      return { rowspan, colspan: 1 }
    }
  }
  return {
    rowspan: 1,
    colspan: 1
  }
}
</script>
<style lang="scss" scoped>
.table-container {
  width: 100%;
  height: 100%;
  overflow-x: auto;
}

:deep(div.el-table .el-table__body tr.el-table__row td.el-table__cell .cell) {
  line-height: 20px !important;
}

:deep(div.el-table .el-table__header th.el-table__cell) {
  background-color: var(--tc-th-background);
}

:deep(.banksflows-column-class .cell) {
  padding: 0 !important;
}

:deep(.banksflows-column-class) {
  padding: 0 !important;
  vertical-align: top;
}

:deep(.header-position) {
  vertical-align: bottom !important;
}

:deep(.cell) {
  height: unset !important;
  padding: 0 4px !important;

  .bank-flow {
    border-bottom: 1px solid var(--tc-cell-border);
  }

  .bank-flow-item {
    display: flex;
    justify-content: space-between;
    padding: 0 4px;

    div {
      padding: 0px 4px;
      border-right: 1px solid var(--tc-cell-border);

      &:last-child {
        border-right: none;
      }
    }
  }

  .bank-content {
    display: flex;
    flex-direction: column;
    max-height: unset !important;

    .bank-content-item {
      width: 100%;
      flex: 1;
      justify-content: space-between;
      flex-direction: row;
      border-bottom: 1px solid var(--tc-cell-border);

      .bank-item {
        border-right: 1px solid var(--tc-cell-border);
        width: 33.3%;
        text-align: left;
        padding: 0 4px;
        height: 100%;

        span {
          display: inline-block;
          width: 100%;
          text-align: right;
        }

        &:last-child {
          border-right: none;
        }
      }

      .bank-text {
        white-space: nowrap;
        /* 防止文字换行 */
        overflow: hidden;
        /* 隐藏超出容器的部分 */
        text-overflow: ellipsis;
        /* 超出部分用省略号显示 */
      }
    }
  }
}

:deep(.el-button) {
  height: 20px;
  border-radius: 2px;
  margin: 0 5px 6px;
}
</style>
