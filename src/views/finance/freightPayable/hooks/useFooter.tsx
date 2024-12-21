import { shallowRef, computed } from 'vue'
import { currentPageIndex, tableConfig, pageLimit, selectedInfo } from './useTable'
import type { HooksParams } from '../index.vue'

export const extraInfo = shallowRef({ count: 0, sum: {} })
export const useFooter = (params: HooksParams) => {
  const { onSearch } = params
  const footerData = shallowRef<FooterData>({
    page: currentPageIndex.value,
    limit: pageLimit.value,
    time: []
  })
  const totalAmtMap = [{ label: '单据总金额', key: 'docTotal' }]
  const footerOptions = computed<FooterOptions>(() => {
    const { isSelectAll, selectedData } = selectedInfo.value
    const selectData = isSelectAll ? [] : selectedData
    const { count } = extraInfo.value
    return {
      baseOption: { totalCount: count, isSelectAll, selectData },
      compOption: [{ name: 'pagination' }, { name: 'datePicker' }, { name: 'totalAmt', totalAmtOption: { totalMap: totalAmtMap } }]
    }
  })
  // 根据分页信息重新查询数据
  function footerHandler(event: FooterUpdateEvent) {
    const { key, page, limit, isSelectAll } = event
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
    }
    onSearch('pagination')
  }
  return { footerData, footerOptions, extraInfo, footerHandler }
}
