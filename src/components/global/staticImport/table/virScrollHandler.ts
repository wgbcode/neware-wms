import { ElMessage } from 'element-plus'
import { type ScrollParams } from './addVirDefaultConfig'
import type { TableConfig, TableInstance } from './index.vue'
import { type ShallowRef } from 'vue'

const lazyMap = new WeakMap()
let lazyTotalCount = 10000
export const virScrollHandler = (params: ScrollParams, config: TableConfig, tableInstance: ShallowRef<TableInstance<'virTable'>>) => {
  // 判断是否要开启数据懒加载功能
  if (config.lazyOption?.enable) {
    const { maxPageSize } = config.lazyOption
    const { scrollTop } = params
    // 计算可视区域结束序号、结束序号当前页码、结束序号下一页页码
    const endIndex = maxPageSize + scrollTop / 20 - 1
    const endIndexCurPage = Math.floor(endIndex / maxPageSize) + 1
    const endIndexNextPage = endIndexCurPage + 1
    // 计算可视区域开始序号、开始序号当前页码、开始序号上一页页码
    const startIndex = endIndex - maxPageSize + 1
    const startIndexCurPage = Math.floor(startIndex / maxPageSize) + 1
    const startIndexPrePage = startIndexCurPage - 1
    // 判断是否有缓存
    if (!lazyMap.has(tableInstance)) {
      lazyTotalCount = 10000
      lazyMap.set(tableInstance, { request: new Map() })
    }
    // 根据页码获取和更新表格数据
    const requestMap = [
      { page: endIndexCurPage, type: 'curPage' },
      { page: endIndexNextPage, type: 'nextPage' },
      { page: startIndexCurPage, type: 'curPage' },
      { page: startIndexPrePage, type: 'prePage' }
    ]
    requestMap.forEach((item) => {
      getLazyDataByPage({ config, tableInstance, page: item.page, type: item.type })
    })
  }
}

interface GetLazyDataParams {
  config: TableConfig
  tableInstance: ShallowRef<TableInstance<'virTable'>>
  page: number
  type: string
}
async function getLazyDataByPage({ config, tableInstance, page, type }: GetLazyDataParams) {
  const { maxPageSize, asyncRequestFn } = config.lazyOption!
  const { request } = lazyMap.get(tableInstance)
  // 判断当前页码、上一页/下一页页码是否有数据
  const isExit =
    type === 'curPage' || (type === 'prePage' && page >= 1) || (type === 'nextPage' && page <= Math.floor(lazyTotalCount / maxPageSize) + 1)
  // 判断请求是否正在进行和数据是否已成功加载
  if (isExit && !request.get(page) && tableInstance.value) {
    try {
      request.set(page, true)
      const params = { pageIndex: page, pageSize: maxPageSize }
      tableInstance.value.loading = true
      const { data, totalCount, code } = await asyncRequestFn(params)
      if (code === 200) {
        // 更新组件数据
        const startIndex = (page - 1) * maxPageSize
        data.forEach((item, index) => {
          if (tableInstance.value) {
            Reflect.set(tableInstance.value.newData, startIndex + index, item)
          }
        })
        // 更新行总数和重新渲染组件
        if (lazyTotalCount === 10000) {
          lazyTotalCount = totalCount
          tableInstance.value.reRender()
        } else {
          tableInstance.value.loading = false
        }
      } else {
        request.clear(page)
      }
    } catch (error) {
      request.clear(page)
      tableInstance.value.loading = false
      ElMessage({ type: 'error', message: `${error}` })
    }
  }
}
