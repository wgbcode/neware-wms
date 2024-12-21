import { shallowRef, computed, useTemplateRef } from 'vue'
import type { HooksParams } from '../index.vue'
import { type UploadOption } from '@/components/uploadDialog/index.vue'
import { ElMessage } from 'element-plus'
import { selectedInfo } from './useTable'

export const queryList = shallowRef<QueryList>({
  deptIndi: '',
  orderAmt: '',
  invoiceBal: [],
  isMiddleman: '',
  canInterRecon: '',
  invoiceBalPcnt: [],
  fromDataBase: [],
  lastDeliveryDays: [],
  orderFrom: [],
  isShowAll: false,
  isOnlyShowNoneReplace: false,
  sortOrder: 'desc', // desc 降序，asc 升序
  sortName: 'orderUpdateDate'
})
export const oidcinfo = shallowRef<SelectList[]>([])
export const orderAmtList = [
  { label: 'x<=0.05', value: ',0.05' },
  { label: '0.05<X≤10', value: '0.05,10' },
  { label: '10<X≤50', value: '10,50' },
  { label: '50<X≤100', value: '50,100' },
  { label: '100<X≤500', value: '100,500' },
  { label: '500<X', value: '500,' }
]
export const useSearch = (params: HooksParams) => {
  const { initSearch, exportTable } = params
  const indicatorList = computed<SelectList[]>(() => {
    const newList = oidcinfo.value.map((i) => ({ label: i.name, value: i.id }))
    return [{ label: '无', value: 'N' }, ...newList]
  })
  const isDueList = [
    { label: '全部', value: true },
    { label: '未清', value: false }
  ]
  const isMiddleman = [
    { label: '全部', value: 'all' },
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ]
  // const invoiceBalList = [
  //   { label: 'x<=0.05', value: ',0.05' },
  //   { label: '0.05<X≤10', value: '0.05,10' },
  //   { label: '10<X≤50', value: '10,50' },
  //   { label: '50<X≤100', value: '50,100' },
  //   { label: '100<X≤500', value: '100,500,' },
  //   { label: '500<X', value: '500,' }
  // ]
  const fromDataBaseList = [
    { label: '200409', value: '200409' },
    { label: '200907', value: '200907' },
    { label: '201304', value: '201304' }
  ]
  const canInterReconList = [
    { label: '不可清单', value: 0 },
    { label: '可清单', value: 1 },
    { label: '已清单', value: 2 }
  ]
  const orderFromList = [
    { label: '国内订单', value: 1 },
    { label: '国外订单', value: 2 },
    { label: '印度订单', value: 3 }
  ]
  const queryConfig = computed(() => {
    const isDueAttrs = { clearable: true, placeholder: '是否逾期', optionV2: isDueList }
    const isMiddlemanAttrs = { clearable: true, placeholder: '是否中间供应商', optionV2: isMiddleman }
    const indicatorAttrs = { clearable: true, placeholder: '标识', optionV2: indicatorList, multiple: true }
    const orderAmtAttrs = { clearable: true, placeholder: '订单金额', optionV2: orderAmtList }
    // const invoiceBalAttrs = { clearable: true, placeholder: '应收余额', optionV2: invoiceBalList }
    const fromDataBaseAttrs = { clearable: true, multiple: true, placeholder: '账套', optionV2: fromDataBaseList }
    const canInterReconAttrs = { clearable: true, placeholder: '清单状态', optionV2: canInterReconList }
    const orderFromAttrs = { clearable: true, multiple: true, placeholder: '订单来源', optionV2: orderFromList }
    return [
      { prop: 'isShowAll', name: 'select', attr: isDueAttrs, on: { change: initSearch } },
      { prop: 'indicatorList', name: 'select', attr: indicatorAttrs },
      { prop: 'cardCode', name: 'input', attr: { placeholder: '业务伙伴代码/名称' }, on: { change: initSearch } },
      { prop: 'slpName', name: 'input', attr: { placeholder: '销售员' }, on: { change: initSearch } },
      { prop: 'docEntry', name: 'input', attr: { placeholder: '销售订单号' }, on: { change: initSearch } },
      { prop: 'orderAmt', name: 'select', attr: orderAmtAttrs, on: { change: initSearch }, filter: true },
      // { prop: 'invoiceBal', name: 'select', attr: invoiceBalAttrs, on: { change: initSearch }, filter: true },
      { prop: 'invoiceBal', name: 'textPicker', attr: { title: '应收余额' }, on: { change: initSearch }, filter: true },
      { prop: 'isMiddleman', name: 'select', attr: isMiddlemanAttrs, filter: true },
      { prop: 'invoiceBalPcnt', name: 'textPicker', attr: { suffix: '%', title: '应收余额比例' }, filter: true },
      { prop: 'lastDeliveryDays', name: 'textPicker', attr: { title: '最后交货日期' }, filter: true },
      { prop: 'fromDataBase', name: 'select', attr: fromDataBaseAttrs, filter: true },
      { prop: 'canInterRecon', name: 'select', attr: canInterReconAttrs, filter: true },
      { prop: 'orderFrom', name: 'select', attr: orderFromAttrs, filter: true },
      { text: '查询', name: 'button', attr: { type: 'primary', iconName: 'btn-search' }, on: { click: initSearch } },
      { text: '对账单', name: 'button', attr: { type: 'primary', iconName: 'btn-export-table' }, on: { click: exportTable } },
      { text: '上传', name: 'button', attr: { type: 'primary', iconName: 'btn-upload' }, on: { click: uploadFile } }
    ]
  })
  // 上传附件
  const uploadDialog = useTemplateRef<DialogInstance<UploadOption> | null>('uploadDialog')
  function uploadFile() {
    const { selectedData } = selectedInfo.value
    const message = new Map([
      [selectedData.length === 0, '请选择单据'],
      [new Set(selectedData.map((i) => i.cardCode)).size > 1, '只能选择同一客户']
    ]).get(true)
    if (message) {
      ElMessage({ type: 'warning', message })
    } else {
      const saleOrders = selectedData.map((i) => ({ orderId: i.docEntry, sboId: i.sboId }))
      uploadDialog.value!.openDialog({
        url: '/Finance/SalesInvoice/AddClientReconciliation',
        data: { model: { saleOrders, cardCode: selectedData[0].cardCode } } // 附加回传参数
      })
    }
  }
  return { queryList, queryConfig, oidcinfo }
}
