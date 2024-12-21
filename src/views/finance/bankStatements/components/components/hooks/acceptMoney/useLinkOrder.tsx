import { computed, defineComponent, nextTick, shallowRef } from 'vue'
import type { AcceptMoneyChildLinkOrderRow, AcceptMoneyLinkOrderRow, RightCardHookParams } from '@/views/finance/bankStatements/types'
import { useGlobal, type AddSuffixAmtCompCBParams } from '../common/useGlobal'
import { ElMessage } from 'element-plus'
import Icon from '@/components/global/dynamicImport/icon/index.vue'
import { postMessage } from '@/hooks/useMessage'

type UpdateParentParams = { id: number; data: AcceptMoneyChildLinkOrderRow[] }
interface DocTypeMapValue {
  id: number
  prefix: string
}
export const acceptMoneyDocTypeMap: Record<string, DocTypeMapValue> = {
  cashDeposit: { id: 1, prefix: 'BD-' },
  borrowMoney: { id: 2, prefix: 'BW-' },
  saleOrder: { id: 3, prefix: 'SE-' }
}
export const useLinkOrder = (params: RightCardHookParams) => {
  const { onSearch, linkOrderAgTable, baseInfoAgTable, linkOrderTableData } = params
  const { customSuffixInputComp, addRowOfJournalsDetailByLinkOrder, updateBaseInfoPayAmount, updateBaseInfoPayAcctCode, updateRowOfJournalsDetail } =
    useGlobal(params)
  const { saleOrder, cashDeposit, borrowMoney } = acceptMoneyDocTypeMap
  const inTotalAmt = shallowRef<number>(0)
  const docTypeOption = [
    { label: 'BD-保证金', value: cashDeposit.id },
    { label: 'BW-借款', value: borrowMoney.id },
    { label: 'SE-销售订单', value: saleOrder.id }
  ]
  const searchConfig = [
    { name: 'input', prop: 'docEntry', attr: { placeholder: '审批序号' }, on: { change: onSearch } },
    { name: 'select', prop: 'docType', attr: { optionV2: docTypeOption, placeholder: '单据类型' } },
    { name: 'input', prop: 'receiptAccount', attr: { placeholder: '付款方名称' }, on: { change: onSearch } },
    { name: 'input', prop: 'receiptAmount', attr: { placeholder: '付款金额' }, on: { change: onSearch } },
    { name: 'button', text: '查询', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: onSearch } }
  ]
  const docEntryCellComp = defineComponent({
    props: { params: { type: Object as AgParams<AcceptMoneyLinkOrderRow>, required: true } },
    setup(props) {
      const { docEntry, docType } = props.params.data!
      const { saleOrder, cashDeposit, borrowMoney } = acceptMoneyDocTypeMap
      const prefix =
        new Map([
          [docType === saleOrder.id, saleOrder.prefix],
          [docType === cashDeposit.id, cashDeposit.prefix],
          [docType === borrowMoney.id, borrowMoney.prefix]
        ]).get(true) ?? ''
      const openDetail = () => {
        if (docType === saleOrder.id) {
          postMessage('openSaleOrderDetail', { docEntry })
        } else {
          ElMessage({ type: 'warning', message: '该类型单据暂不支持打开详情' })
        }
      }
      return () => (
        <div class="c-flex-ycenter" style={{ display: docEntry ? 'flex' : 'none' }}>
          <Icon name="arrow" color="var(--tc-brand)" size="12" class="c-mr2 c-mb1 c-cursor-p" click={openDetail} stop={true} />
          <span>{prefix + docEntry}</span>
        </div>
      )
    }
  })
  const defineChildTable = defineComponent({
    props: { params: { type: Object as AgParams<AcceptMoneyLinkOrderRow>, required: true } },
    setup(props) {
      const { fullWidthRowData } = props.params.data!
      const childLinkOrderAgTable = shallowRef<AgGridInstance<AcceptMoneyChildLinkOrderRow> | null>(null)
      const getChildSuffixInputRenderer = (field: string) => {
        const params = {
          field,
          suffixField: 'currency',
          getAgGridInstance: () => childLinkOrderAgTable.value,
          disabled: false,
          cb: (params: AddSuffixAmtCompCBParams) => updateFullWidthData({ id: params.rowData.fullWidthRowId, data: params.tableData })
        }
        return customSuffixInputComp<AcceptMoneyChildLinkOrderRow>(params)
      }
      const config = { forbidStriped: true, autoSelectRowByChecked: true, forbidAutoSelectRowOnClick: true }
      const columns = [
        { type: 'checked', pinned: 'left' },
        { headerName: '应收发票号', field: 'invoiceNo', width: 100 },
        { headerName: '应收金额', field: 'invoiceTotalAmount', width: 100, formatType: 'price' },
        { headerName: '应收余额', field: 'invoiceBalance', width: 100, formatType: 'price' },
        {
          headerName: '入账金额',
          field: 'inAccountAmount',
          width: 130,
          align: 'right',
          cellRenderer: getChildSuffixInputRenderer('inAccountAmount')
        }
      ]
      // 子表数据修改时，手动更新父级表格数据
      const updateFullWidthData = ({ id, data }: UpdateParentParams) => {
        const preNode = linkOrderAgTable.value!.getRowNode(id - 1)
        const curNode = linkOrderAgTable.value!.getRowNode(id)
        preNode.updateData({ ...preNode.data, fullWidthRowData: data, invoices: data })
        curNode.updateData({ ...curNode.data, fullWidthRowData: data, invoices: data })
      }
      const height = fullWidthRowData?.length === 0 ? 52 : (fullWidthRowData?.length + 1.2) * 20
      const style = { 'margin-left': '320px', height: height + 'px' }
      return () => (
        <div class="c-mt5" style={style}>
          <c-ag-table
            ref={childLinkOrderAgTable}
            config={config}
            data={fullWidthRowData}
            columns={columns}
            calss="c-flex-1"
            style="width:475px"
            onUpdateParentData={updateFullWidthData}
          />
        </div>
      )
    }
  })
  const defaultExpandFullWidthRowIndex = shallowRef<number[]>([])
  const linkOrderTableConfig = computed<AgTableConfig>(() => {
    return {
      forbidStriped: true,
      autoSelectRowByChecked: true,
      forbidAutoSelectRowOnClick: true,
      serverSortEnable: true,
      attr: {
        fullWidthCellRenderer: defineChildTable, // 跨网格行组件
        context: {
          hiddenIconOfEmptyFullWidthRow: true, // 跨网格行组件数据为空时，不显示显示隐藏 Icon
          defaultExpandFullWidthRowIndex: defaultExpandFullWidthRowIndex.value // 根据 index 默认展开部分跨网格行组件
        }
      }
    }
  })
  const getSuffixInputRenderer = (field: string) => {
    const params = {
      field,
      suffixField: 'currency',
      getAgGridInstance: () => linkOrderAgTable.value as AgGridInstance<AcceptMoneyLinkOrderRow>,
      disabled: false,
      cb: updateData
    }
    return customSuffixInputComp<AcceptMoneyLinkOrderRow>(params)
  }
  const updateData = (params: AddSuffixAmtCompCBParams) => {
    const { currentValue, rowData } = params
    updatePayAmountInAcceptMoney(params)
    // 更新日记账明细借贷发生额
    updateRowOfJournalsDetail({ type: 'Amt', data: { docEntry: rowData.docEntry, currentValue } })
  }
  function updatePayAmountInAcceptMoney(params: AddSuffixAmtCompCBParams) {
    const newAcceptMoney = params.tableData.reduce<number>((pre, next) => {
      next.checked && (pre += next.inAccountAmount)
      return pre
    }, 0)
    // 更新出账金额合计
    inTotalAmt.value = newAcceptMoney
    // 更新基本信息的收款金额
    updateBaseInfoPayAmount(newAcceptMoney)
  }
  const linkOrderColumns: AgColumnConfig[] = [
    { compName: 'fullWidthRowExpand', pinned: 'left', width: 30 },
    { type: 'checked' },
    { type: 'index' },
    { headerName: '单据编号', field: 'docEntry', width: 100, cellRenderer: docEntryCellComp },
    { headerName: '收款方', field: 'payee', width: 150 },
    { headerName: '单据金额', field: 'docTotal', width: 100, formatType: 'price', sortable2: 'custom' },
    { headerName: '已收金额', field: 'receiptAmount', width: 100, formatType: 'price' },
    { headerName: '未收金额', field: 'dueAmount', width: 100, formatType: 'price', sortable2: 'custom' },
    { headerName: '入账金额', field: 'inAccountAmount', width: 130, align: 'right', cellRenderer: getSuffixInputRenderer('inAccountAmount') },
    { headerName: '销售员', field: 'salesMan', width: 80 },
    { headerName: '开票金额', field: 'billTotalAmt', width: 100, formatType: 'price' }
  ]
  // 表格初始化时，若存在自动选中行，会执行第一次，从而自动更新基本信息和日记账明细中的数据
  async function linkOrderSelectionHandler(event: AgSelectedInfo<AcceptMoneyLinkOrderRow>) {
    await nextTick()
    const { selectedData, source } = event
    // 选择的业务伙伴不唯一时，手动取消行选中(点击复选框时才触发)
    if (new Set(selectedData.map((i) => i.cardCode)).size > 1) {
      source === 'checkboxSelected' && cancelRowChecked()
    } else {
      const totalAmt = selectedData.reduce((pre, next) => pre + next.inAccountAmount!, 0)
      // 更新出账金额合计
      inTotalAmt.value = totalAmt
      // 更新基本信息的收款金额
      updateBaseInfoPayAmount(totalAmt)
      // 更新基本信息的业务伙伴信息
      updateBaseInfoCardCode(selectedData)
      // 更新基本信息
      updateBaseInfoPayAcctCode({ slpCode: selectedData[0]?.slpCode, slpName: selectedData[0]?.salesMan })
      // 日记账明细新增行
      addRowOfJournalsDetailByLinkOrder<AcceptMoneyLinkOrderRow>(selectedData, 'docEntry')
      // 选中时，自动展开和隐藏跨网格行组件(点击复选框时才触发)
      source === 'checkboxSelected' && autoToggleFullWidthRowExpand()
    }
  }
  function updateBaseInfoCardCode(selectedData: AcceptMoneyLinkOrderRow[]) {
    const { cardCode, cardName } = selectedData.length > 0 ? selectedData[0] : { cardCode: '', cardName: '' }
    const { updateCellData, forceRefreshRow } = baseInfoAgTable.value!
    updateCellData({ id: 0, field: 'cardCode', value: cardCode })
    updateCellData({ id: 0, field: 'cardName', value: cardName })
    forceRefreshRow(0)
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
      ensureIndexVisibleAfterRender(rowIndex)
      ElMessage({ type: 'warning', message: '关联单据只能选择同一个业务伙伴' })
    }
  }
  function autoToggleFullWidthRowExpand() {
    const { instance, gridApi } = linkOrderAgTable.value!
    const focusedCellInfo = gridApi.getFocusedCell()
    // 只会有手动点击复选框时触发
    if (focusedCellInfo) {
      const { rowIndex } = focusedCellInfo
      let isNeedToggleExpand = false
      let newIndex: number[] = [...defaultExpandFullWidthRowIndex.value]
      // 拿到不包含跨网格行组件的表格数据
      const rawTableData = instance.getRowData().filter((i) => !i.isFullWidthRow)
      rawTableData.forEach((item, index) => {
        const { id, checked, alreadyExpandFullWidthRow } = item
        if (id === rowIndex) {
          // 选中但未展开，则手动帮助展开
          if (checked && !alreadyExpandFullWidthRow) {
            newIndex.push(index)
            isNeedToggleExpand = true
          }
          // 未选中但已展开，则手动帮助隐藏
          if (!checked && alreadyExpandFullWidthRow) {
            newIndex = newIndex.filter((i) => i !== index)
            isNeedToggleExpand = true
          }
        }
      })
      if (isNeedToggleExpand) {
        defaultExpandFullWidthRowIndex.value = newIndex // 重新设置默认展开跨网格行组件 index
        linkOrderTableData.value = rawTableData
        ensureIndexVisibleAfterRender(rowIndex)
      }
    }
  }
  // TODO:渲染完成后滚动到指定行(待优化, 不使用定时器)
  function ensureIndexVisibleAfterRender(rowIndex: number) {
    let timer: null | NodeJS.Timeout = setTimeout(() => {
      linkOrderAgTable.value!.gridApi.ensureIndexVisible(rowIndex, 'middle')
      timer && clearTimeout(timer)
      timer = null
    }, 1000)
  }

  return {
    searchConfig,
    linkOrderTableConfig,
    linkOrderColumns,
    inTotalAmt,
    defaultExpandFullWidthRowIndex,
    linkOrderSelectionHandler
  }
}
