import { shallowRef, type Ref } from 'vue'
import { GetOidcinfo } from '@/api/common'
import { requestListAsync } from '@/utils/requestList'

// 获取和缓存标识列表
const indicatorList = shallowRef<SelectList[]>([])
export const setIndicatorList = async (ref: Ref<SelectList[]>) => {
  if (indicatorList.value.length === 0) {
    await requestListAsync(GetOidcinfo, indicatorList, { label: 'name', value: 'id' })
  }
  ref.value = indicatorList.value
}
