import { type Ref } from 'vue'

type GetApi<T> = (params: T) => CustomResponse<SelectList[]>
type PostApi<T> = (data: T) => CustomResponse<SelectList[]>
type Api<T> = GetApi<T> | PostApi<T>

// 下拉列表异步请求
export function requestList<T = any>(api: Api<T>, ref: Ref, keyMap = { label: 'value', value: 'key' }, params?: any) {
  api(params).then((res) => {
    const { code, result, data } = res
    const selectList = result || data
    if (code === 200) {
      const list = selectList?.map((item) => ({
        ...item,
        label: item[keyMap.label],
        value: item[keyMap.value]
      }))
      list && (ref.value = list)
    }
  })
}

// 下拉列表同步请求
export async function requestListAsync<T = any>(api: Api<T>, ref: Ref, keyMap = { label: 'value', value: 'key' }, params?: any) {
  const res = await api(params)
  const { code, result, data } = res
  const selectList = result || data
  if (code === 200) {
    const list = selectList?.map((item) => ({
      ...item,
      label: item[keyMap.label],
      value: item[keyMap.value]
    }))
    list && (ref.value = list)
  }
}
