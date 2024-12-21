import { type Ref } from 'vue'

type GetApi<T> = (params: T) => CustomResponse
type PostApi<T> = (data: T) => CustomResponse
type PagiRef = Ref<{ page: number; pageSize: number; total: number }>
type RequestSuccess<T, K> = {
  api: GetApi<T> | PostApi<T>
  params?: any
  ref?: Ref<K>
  key?: string
  pagiRef?: PagiRef
  loading?: Ref<boolean>
  cb?: (res: Awaited<CustomResponse>) => void
}

export function requestSuccess<T = any, K = any>({ api, ref, params = {}, loading, pagiRef, key, cb }: RequestSuccess<T, K>) {
  loading && (loading.value = true)
  api(params)
    .then((res) => {
      const { code, result, data, count } = res
      if (code === 200) {
        ref && (ref.value = key ? res[key] : result || data)
        pagiRef && (pagiRef.value = { ...pagiRef.value, total: Number(count) })
      }
      cb && cb(res)
    })
    .finally(() => {
      loading && (loading.value = false)
    })
}

export async function requestSuccessAsync<T = any, K = any>({ api, ref, key, params = {}, pagiRef, loading, cb }: RequestSuccess<T, K>) {
  try {
    loading && (loading.value = true)
    const res = await api(params)
    const { code, result, data, count } = res
    if (code === 200) {
      ref && (ref.value = key ? res[key] : result || data)
      pagiRef && (pagiRef.value = { ...pagiRef.value, total: Number(count) })
    }
    cb && cb(res)
  } finally {
    loading && (loading.value = false)
  }
}
