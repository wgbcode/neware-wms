import type { JournalsDetailRow, RightCardHookParams } from '@/views/finance/bankStatements/types'
import { payMoneyDocTypeMap } from '../payMoney/useLinkOrder'
import { acceptMoneyDocTypeMap } from '../acceptMoney/useLinkOrder'
import { useGlobal, type AddSuffixAmtCompCBParams } from './useGlobal'
import { defineComponent } from 'vue'

export const useJournalsDetail = (params: RightCardHookParams) => {
  const { journalsDetailAgTable } = params
  const { customSuffixInputComp, queryList, curComponent } = useGlobal(params)
  const journalsDetailTableConfig: AgTableConfig = {
    forbidAutoSelectRowOnClick: true,
    forbidStriped: true,
    autoSelectRowByChecked: true,
    autoMergeFollowFirstColumn: true
  }
  const getSuffixInputRenderer = (field: string) => {
    const disabled = new Map([
      // 付款：采购付款不可编辑
      [curComponent.value === 'payMoney', queryList.value.docType === payMoneyDocTypeMap.purchasePayments.id],
      // 收款：销售订单不可编辑
      [curComponent.value === 'acceptMoney', queryList.value.docType === acceptMoneyDocTypeMap.saleOrder.id]
    ]).get(true)
    const params = {
      field,
      suffixField: 'currency',
      getAgGridInstance: () => journalsDetailAgTable.value,
      cb: updateJournalsDetailExtraData,
      disabled: disabled
    }
    return customSuffixInputComp<JournalsDetailRow>(params)
  }
  const docEntryCellComp = defineComponent({
    props: { params: { type: Object as AgParams<JournalsDetailRow>, required: true } },
    setup(props) {
      const { docEntry, docType } = props.params.data!
      const { saleOrder, cashDeposit, borrowMoney, purchasePayments, expenseAccount, serviceCommission, bidBond, refund } =
        curComponent.value === 'payMoney' ? payMoneyDocTypeMap : acceptMoneyDocTypeMap
      const prefix =
        new Map([
          [docType === saleOrder?.id, saleOrder],
          [docType === cashDeposit?.id, cashDeposit],
          [docType === borrowMoney?.id, borrowMoney],
          [docType === purchasePayments?.id, purchasePayments],
          [docType === expenseAccount?.id, expenseAccount],
          [docType === serviceCommission?.id, serviceCommission],
          [docType === bidBond?.id, bidBond],
          [docType === refund?.id, refund]
        ]).get(true)?.prefix ?? ''
      return () => <span>{prefix + docEntry}</span>
    }
  })
  const journalsDetailColumns: AgColumnConfig[] = [
    { type: 'checked' },
    { headerName: '关联单据', field: 'docEntry', width: 100, autoMergeCol: true, cellRenderer: docEntryCellComp },
    { headerName: '科目号', field: 'code', width: 70 },
    { headerName: '科目名称', field: 'name', width: 160 },
    {
      headerName: '借方发生额',
      field: 'debitAmt',
      width: 125,
      align: 'right',
      cellRenderer: getSuffixInputRenderer('debitAmt')
    },
    {
      headerName: '贷方发生额',
      field: 'creditAmt',
      width: 125,
      align: 'right',
      cellRenderer: getSuffixInputRenderer('creditAmt')
    },
    { headerName: '借方发生总额', field: 'debitAmtTotal', width: 100, formatType: 'price', autoMergeCol: true },
    { headerName: '贷方发生总额', field: 'creditAmtTotal', width: 100, formatType: 'price', autoMergeCol: true },
    { headerName: '备注', field: 'remark', width: 250, editable: true, singleClickEdit: true }
  ]
  function updateJournalsDetailExtraData(params: AddSuffixAmtCompCBParams<JournalsDetailRow>) {
    const { parentParams, rowData, currentValue } = params
    const { field, getAgGridInstance } = parentParams
    const { id, docEntry } = rowData
    const { instance } = getAgGridInstance()!
    const tableData = instance.getRowData()
    const totalAmt = tableData.filter((i) => i.docEntry === docEntry && i.id !== id).reduce((pre, next) => pre + next[field], Number(currentValue))
    const totalFirstRowId = tableData.find((i) => i.docEntry === docEntry).id
    // 更新借贷方发生总额单元格数据
    getAgGridInstance()!.updateCellData({ id: totalFirstRowId, field: `${field}Total`, value: Number(totalAmt) })
  }
  return {
    journalsDetailTableConfig,
    journalsDetailColumns,
    journalsDetailAgTable
  }
}
