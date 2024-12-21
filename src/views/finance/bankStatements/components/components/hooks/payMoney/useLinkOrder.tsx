import { shallowRef, nextTick } from 'vue'
import type { PayMoneyLinkRow, RightCardHookParams } from '@/views/finance/bankStatements/types'
import { useGlobal } from '../common/useGlobal'
import { ElMessage } from 'element-plus'
interface DocTypeMapValue {
  id: number
  prefix: string
}
export const payMoneyDocTypeMap: Record<string, DocTypeMapValue> = {
  purchasePayments: { id: 1, prefix: 'PS-' },
  expenseAccount: { id: 2, prefix: 'RB-' },
  serviceCommission: { id: 3, prefix: 'CM-' },
  bidBond: { id: 4, prefix: 'BD-' },
  borrowMoney: { id: 5, prefix: 'BW-' },
  refund: { id: 6, prefix: 'RF-' }
}
export const useLinkOrder = (params: RightCardHookParams) => {
  const { onSearch, baseInfoAgTable, linkOrderAgTable, linkOrderTableData } = params
  const outTotalAmt = shallowRef<number>(0) // 流水金额合计
  const { addRowOfJournalsDetailByLinkOrder, updateBaseInfoPayAcctCode, updateBaseInfoPayAmount } = useGlobal(params)
  const { purchasePayments, expenseAccount, serviceCommission, bidBond, borrowMoney, refund } = payMoneyDocTypeMap
  
  const docTypeOption = [
    { label: 'PS-采购付款', value: purchasePayments.id },
    { label: 'RB-报销单', value: expenseAccount.id },
    { label: 'CM-服务提成', value: serviceCommission.id },
    { label: 'BD-投标保证金', value: bidBond.id },
    { label: 'BW-借款', value: borrowMoney.id },
    { label: 'RF-退款', value: refund.id }
  ]
  const searchConfig = [
    { name: 'input', prop: 'paymentNumber', attr: { placeholder: '审批序号' }, on: { change: onSearch } },
    { name: 'select', prop: 'docType', attr: { optionV2: docTypeOption, placeholder: '单据类型' } },
    { name: 'input', prop: 'receiveAccountName', attr: { placeholder: '付款方名称' }, on: { change: onSearch } },
    { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: onSearch } }
  ]
  const linkOrderTableConfig: AgTableConfig = {
    forbidStriped: true,
    autoSelectRowByChecked: true,
    serverSortEnable: true
  }
  const linkOrderColumns: AgColumnConfig[] = [
    { type: 'checked' },
    { type: 'index' },
    { headerName: '审批序号', field: 'paymentNumber', width: 80 },
    { headerName: '单据来源', field: 'docTypeName', width: 60 },
    { headerName: '单据金额', field: 'amount', width: 80, formatType: 'price', sortable2: 'custom' },
    { headerName: '扣款金额', field: 'cutPayment', width: 80, formatType: 'price' },
    { headerName: '出账金额', field: 'actualPay', width: 80, formatType: 'price', sortable2: 'custom' },
    { headerName: '收款方名称', field: 'receiveAccountName', width: 150 },
    { headerName: '标识', field: 'indicatorName', width: 60 },
    { headerName: '状态', field: 'statusName', width: 50 },
    { headerName: '币种', field: 'currency', width: 50 },
    { headerName: '出账金额', field: 'outAmount', width: 80, formatType: 'price' }
  ]
  // 表格初始化时，若存在自动选中行，会执行第一次，从而自动更新基本信息和日记账明细中的数据
  async function linkOrderSelectionHandler(event: AgSelectedInfo<PayMoneyLinkRow>) {
    await nextTick()
    const { selectedData, source } = event
    // 选择的银行科目不一样时，手动取消行选中(点击复选框时才触发)
    // 合并所有 journalDetailResps 并提取 code
    const tempList = selectedData.map((item) => item.journalDetailResps.find((detail) => detail.debitAmt === 0)).filter(Boolean)
    if (new Set(tempList.map((item) => item?.code)).size > 1) {
      source === 'checkboxSelected' && cancelRowChecked()
    } else {
      const totalAmt = selectedData.reduce((pre, next) => pre + next.actualPay!, 0)
      // 更新出账金额合计
      outTotalAmt.value = totalAmt
      // 更新基本信息的收款金额
      updateBaseInfoPayAmount(totalAmt)

      // 如果没有银行科目，则填写选中的第一条数据的银行科目填充
      const { instance } = baseInfoAgTable.value!
      const accountCode = instance.getRowData()[0]?.accountCode
      if (!accountCode) {
        const { journalDetailResps } = selectedData[0]
        const findData = journalDetailResps.find((item) => item.debitAmt === 0)
        if (findData && findData.code) {
          // rate: findData.rate
          updateBaseInfoPayAcctCode({ accountCode: findData.code, currency: findData.currency })
        }
      }

      // 日记账明细新增行
      addRowOfJournalsDetailByLinkOrder<PayMoneyLinkRow>(selectedData, 'paymentNumber')
    }
  }

  function cancelRowChecked() {
    const { gridApi, instance } = linkOrderAgTable.value!
    const focusedCellInfo = gridApi.getFocusedCell()
    if (focusedCellInfo) {
      const { rowIndex } = focusedCellInfo
      linkOrderTableData.value = instance.getRowData().flatMap((item) => {
        const result = item.id === rowIndex ? { ...item, checked: false } : item
        return item.isFullWidthRow ? [] : result
      })
      ElMessage({ type: 'warning', message: '只能选择相同银行科目' })
    }
  }
  return {
    searchConfig,
    linkOrderTableConfig,
    linkOrderColumns,
    outTotalAmt,
    linkOrderSelectionHandler
  }
}
