import { ElTable } from 'element-plus'
import { AgGridVue } from 'ag-grid-vue3'
import type { PropType } from 'vue'
import type { GridApi, IRowNode, ICellRendererParams, SelectionEventSourceType } from 'ag-grid-community'
import type { ColumnsConfigObj } from '@/components/global/staticImport/table/index.vue'
import type { BaseOption, CompOption } from '@/components/global/staticImport/footer/index.vue'
import type {
  AgCustomTableConfig,
  AgCustomColumnConfig,
  AgServerSortParams,
  UpdateCellDataParmas,
  UpdateRowDataParmas
} from '@/components/global/staticImport/agTable/index.vue'

// 自定义全局公共类型
declare global {
  // 任意对象
  type AnyObject<T = any> = {
    [key: string]: T
  }

  // 响应数据
  type CustomResponse<T = any> = Promise<{
    code: number
    message: null | string
    data?: T
    result?: T
    count?: number
    [key: string]: any
  }>

  // 搜索栏参数
  type QueryList = {
    [key: string]: any
    page?: number // 页码
    limit?: number // 分页大小
    sortOrder?: 'desc' | 'asc' // desc 降序，asc 升序
    sortName?: string // 排序字段
  }

  // 下拉列表
  type SelectList = {
    [key: string]: any
    label: string
    value: string | number | boolean
  }

  // 弹窗实例
  type DialogInstance<T = any> = {
    openDialog: (...args: T[]) => void
  }

  // c-table 组件实例
  type TableInstance = {
    instance: InstanceType<typeof ElTable>
    getInstance: () => InstanceType<typeof ElTable>
  }

  // c-ag-table 自定义配置
  type AgTableConfig = AgCustomTableConfig
  type AgColumnConfig = AgCustomColumnConfig
  type AgSortParams = AgServerSortParams

  // c-ag-table 组件实例
  type AgGridInstance<T = AnyObject> = {
    instance: InstanceType<typeof AgGridVue>
    gridApi: GridApi
    applyTransaction: (data: T[]) => void
    getRowNode: (index: number) => IRowNode
    updateCellData: (params: UpdateCellDataParmas) => void
    updateRowData: (params: UpdateRowDataParmas) => void
    forceRefreshRow: (rowId: number) => void
  }

  // c-ag-table 组件选中信息
  type AgSelectedInfo<T = AnyObject> = {
    isSelectAll: boolean
    selectedData: T[]
    source?: SelectionEventSourceType
  }

  // c-ag-table 组件 CellRenderer 参数
  type AgParams<T = AnyObject> = PropType<ICellRendererParams<T>>

  // 表格事件回传参数
  type TableEvenParams<T = AnyObject> = {
    row: T
    column?: ColumnsConfigObj
  }

  // 分页器数据
  type PaginationData = {
    page: number
    pageSize: number
    total: number
    createTime?: string[]
  }

  // footer 组件数据
  type FooterData = {
    page?: number // 页码
    limit?: number // 分页大小
    isSelectAll?: boolean // 是否全选
    time?: string[] // 时间
  }

  // footer 组件配置
  type FooterOptions = {
    baseOption: BaseOption // 基础配置
    compOption: CompOption[] // 组件配置
  }

  // footer 组件 update 事件回传参数
  type FooterUpdateEvent = {
    [key: string]: any
    key: 'checkBox' | 'pagination' // 通过 key 判断事件触发的组件来源
    page?: number // 页码
    limit?: number // 分页大小
    isSelectAll?: boolean // 是否全选
  }
}
