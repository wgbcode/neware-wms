import { shallowRef } from 'vue'
import { GetJournalAcctList, GetCardCodeList, GetAcctList, GetCrminfo } from '@/views/finance/bankStatements/request'
import { requestListAsync } from '@/utils/requestList'
import type { AcctList, CardCodeList, RowData } from '@/views/finance/bankStatements/types'
import { useGlobal } from './useGlobal'
import { setIndicatorList } from '@/utils/setIndicatorList'

// 获取和缓存下拉列表数据
const acctList = shallowRef<AcctList[]>([]) // 总账科目下拉列表：用于收款和付款
const journalAcctList = shallowRef<AcctList[]>([]) // 总账科目下拉列表：用于日记账
const cardCodeList = shallowRef<CardCodeList[]>([]) // 业务伙伴下拉列表
const currencyList = shallowRef<SelectList[]>([]) // 币种下拉列表
const indicatorList = shallowRef<SelectList[]>([]) // 标识下拉列表
export const useSelectList = () => {
  const { getNewestDate } = useGlobal()
  const getJournalAcctList = async () => {
    if (journalAcctList.value.length === 0) {
      await requestListAsync(GetJournalAcctList, journalAcctList, { label: 'acctName', value: 'acctCode' })
      journalAcctList.value = journalAcctList.value.map((i) => ({ ...i, label: i.acctCode + '-' + i.acctName }))
    }
    return journalAcctList.value
  }
  const getCardCodeList = async () => {
    if (cardCodeList.value.length === 0) {
      await requestListAsync(GetCardCodeList, cardCodeList, { label: 'cardCode', value: 'cardCode' })
    }
    return cardCodeList.value
  }
  // params：LeftCard 表格选中的数据，或者一个字符串格式日期
  const getAcctList = async (params: RowData[] | string) => {
    if (acctList.value.length === 0 || typeof params === 'string') {
      await requestListAsync(
        GetAcctList,
        acctList,
        { label: 'acctName', value: 'acctCode' },
        { docDate: typeof params === 'string' ? params : getNewestDate(params) }
      )
      acctList.value = acctList.value.map((i) => ({ ...i, label: i.acctCode + '-' + i.acctName }))
    }
    return acctList.value
  }
  const getCurrencyList = async () => {
    if (currencyList.value.length === 0) {
      await requestListAsync(GetCrminfo, currencyList, { label: 'id', value: 'id' })
    }
    return currencyList.value
  }
  const getIndicatorList = async () => {
    if (indicatorList.value.length === 0) {
      await setIndicatorList(indicatorList)
    }
    return indicatorList.value
  }
  return { getJournalAcctList, getAcctList, getCardCodeList, getCurrencyList, getIndicatorList }
}
