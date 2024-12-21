import { postMessage } from '@/hooks/useMessage'
import { shallowRef, computed } from 'vue'
import { deepClone } from '@/utils/common'
import { currentPageIndex, pageLimit, tableConfig, selectedInfo } from './useTable'
import { queryList, orderAmtList } from './useSearch'
import type { HooksParams } from '../index.vue'

type BTValue = { type: string; qty: number; qtyKey: string }
export const extraInfo = shallowRef({ count: 0, sum: {} })
export const footerData = shallowRef<FooterData>({
  page: currentPageIndex.value,
  limit: pageLimit.value,
  time: []
})
export const bottomBtnType = shallowRef<AnyObject<BTValue>>({
  S: { type: 'primary', qty: 0, qtyKey: '' },
  CS: { type: 'primary', qty: 0, qtyKey: '' },
  N1: { type: 'primary', qty: 0, qtyKey: '' },
  other: { type: 'primary', qty: 0, qtyKey: '' }
})
export const useFooter = (params: HooksParams) => {
  const { onSearch, initSearch } = params
  const totalAmtMap = [
    { label: '合同', key: 'contractTotalAmount' },
    { label: '交货', key: 'deliveryTotalAmount' },
    { label: '开票', key: 'billTotalAmount' },
    { label: '应收', key: 'receivableInvoiceTotalAmount' }
    // { label: '逾期', key: 'overDueAmt', percentKey: 'orderAmt' }
  ]
  const filterBtnsOption = computed(() => {
    const baseOption = [
      { name: '销售S', key: 'S', tooltip: '为剔除税/汇差、赠送订单等影响，销售S仅展示应收余额大于500元的订单' },
      { name: '售后CS', key: 'CS', tooltip: '' },
      { name: '销售N1', key: 'N1', tooltip: '' },
      { name: '其它', key: 'other', tooltip: '' }
    ]
    const result = baseOption.map((i) => {
      const { type, qty } = bottomBtnType.value[i.key]
      return { ...i, type, qty, show: true, click: searchByDep }
    })
    return result
  })
  const commonOption = { name: '销售应收', click: () => postMessage('openSaleReceivable'), iconName: 'btn-customer-receivable', loading: false }
  const dropdownBtnOption = { name: '应收余额', command: (value: string) => commandHandler(value), options: orderAmtList }
  function commandHandler(id: string) {
    queryList.value = { ...queryList.value, invoiceBal: id }
    initSearch()
  }
  const checkBoxOption = { prop: 'isOnlyShowNoneReplace', label: '非更换' }
  const footerOptions = computed<FooterOptions>(() => {
    const { sum, count } = extraInfo.value
    const { isSelectAll, selectedData } = selectedInfo.value
    const selectData = isSelectAll ? getSumData(sum) : selectedData
    return {
      baseOption: { totalCount: count, isSelectAll, selectData },
      compOption: [
        { name: 'pagination' },
        { name: 'datePicker' },
        { name: 'totalAmt', totalAmtOption: { totalMap: totalAmtMap } },
        { name: 'dropdownBtn', dropdownBtnOption },
        { name: 'commonBtn', commonOption },
        { name: 'filterBtns', filterBtnsOption: filterBtnsOption.value },
        { name: 'checkBox', checkBoxOption: checkBoxOption }
      ]
    }
  })
  function footerHandler(event: FooterUpdateEvent) {
    const { key, page, limit, isSelectAll, isOnlyShowNoneReplace } = event
    if (key === 'pagination') {
      if (isSelectAll) {
        currentPageIndex.value = 1
        pageLimit.value = 2000
        !tableConfig.lazyEnable && (tableConfig.lazyEnable = true)
      } else {
        page && (currentPageIndex.value = page)
        limit && (pageLimit.value = limit)
        tableConfig.lazyEnable && (tableConfig.lazyEnable = false)
      }
    } else if (key === 'checkBox') {
      queryList.value = { ...queryList.value, isOnlyShowNoneReplace }
    }
    onSearch('pagination')
  }
  function getSumData(sum: Record<string, number>) {
    return [
      {
        contractTotalAmount: sum.saleOrderAmount,
        deliveryTotalAmount: sum.deliveryAmount,
        receivableInvoiceTotalAmount: sum.invoiceReceiptAmount,
        receiveTotalAmount: sum.receiptAmount,
        billTotalAmount: sum.billAmount,
        overDueAmount: sum.overDueAmount
      }
    ]
  }
  // 根据部门查询数据
  function searchByDep(key: string) {
    changeBtnType(key)
    const deptIndi = queryList.value.deptIndi === key ? '' : key
    queryList.value = { ...queryList.value, deptIndi }
    initSearch()
  }
  function changeBtnType(curkey: string) {
    const obj = deepClone(bottomBtnType.value)
    for (const key in bottomBtnType.value) {
      if (key === curkey) {
        obj[key].type = bottomBtnType.value[key].type === 'primary' ? 'filter' : 'primary'
      } else {
        obj[key].type = 'primary'
      }
    }
    bottomBtnType.value = obj
  }
  return { footerData, footerOptions, extraInfo, bottomBtnType, footerHandler }
}
