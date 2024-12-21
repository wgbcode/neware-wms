import moment from 'moment'
import { dateFormat } from '@/utils/format'
import { getDateStr, isNumber, capitalizeFirstLetter } from '@/utils/common'
import type { AcceptMoneyChildLinkOrderRow, JournalsDetailRow, RightCardHookParams, RowData } from '@/views/finance/bankStatements/types'
import { computed, defineComponent, shallowRef, useTemplateRef } from 'vue'
import type { ModeMap } from '../../../RightCard.vue'
import { ElMessage } from 'element-plus'
import { OutPaymentAddReconcliation, ReceiptReconcliation } from '@/views/finance/bankStatements/request'

// 自定义带后缀单元格组件
export type AddSuffixAmtCompCBParams<T = any> = {
  parentParams: AddSuffixAmtComp // 父级参数
  rowData: T // 当前行数据(最新)
  currentValue: string // 当前单元格更新值
  tableData: T[] // 最新表格数据
}

type AddSuffixAmtComp<T = any> = {
  field: string // 单元格数据字段名
  suffixField: string // 后缀数据字段名
  getAgGridInstance: () => AgGridInstance<T> | null // 实时获取表格实例的回调函数
  cb?: (params: AddSuffixAmtCompCBParams<T>) => void // 更新完当前单格后需要执行的回调函数，如更新其它单元格的数据
  disabled?: boolean
}

type UpdateJournalsDetailActions = {
  type: 'AccountCode' | 'Amt' // AccountCode: 更新银行科目； Amt： 更新借贷发生额
  data: AnyObject
}

// 当前组件枚举：收款 | 付款
const CurComponentEnum = {
  acceptMoney: 'acceptMoney',
  payMoney: 'payMoney'
}

const loading = shallowRef<boolean>(false)
const selectData = shallowRef<RowData[]>([])
const modeMap = shallowRef<ModeMap | null>(null)
const curComponent = shallowRef<'acceptMoney' | 'payMoney' | null>(null)
const activeNames = shallowRef<string[]>(['baseInfo', 'linkOrder', 'journalsDetail'])
const queryList = shallowRef<QueryList>({})

export const useGlobal = (params?: RightCardHookParams) => {
  const waterIds = computed(() => selectData.value.map((i) => i.waterId))
  const waterTotalAmt = computed<number>(() => {
    return selectData.value.reduce((a, b) => a + Number(b.outAmount), 0)
  })

  // 拿到当天日期或者选中流水中的最新日期
  function getNewestDate(selectData: RowData[]) {
    const result =
      selectData?.length !== 0
        ? selectData.reduce((pre, next) => {
            const time = dateFormat(next.dealDate)
            if (pre) {
              const isBefore = moment(pre).isBefore(time)
              return isBefore ? time : pre
            } else {
              return time
            }
          }, '')
        : getDateStr()
    return result
  }

  // 自定义带后缀的输入框组件
  function customSuffixInputComp<T extends AnyObject>(params: AddSuffixAmtComp<T>) {
    const { field, suffixField, getAgGridInstance, cb, disabled = false } = params
    return defineComponent({
      props: { params: { type: Object as AgParams<T>, required: true } },
      setup(props) {
        const cloneData = { ...props.params.data }
        const modelValue = shallowRef<number | string>(cloneData[field])
        const input = useTemplateRef<HTMLElement>('custom-input')
        function updateCellData(value: string) {
          const { id } = cloneData
          const { getRowNode, forceRefreshRow, instance } = getAgGridInstance()!
          // 更新当前单元格数据
          getRowNode(id).setDataValue(field, Number(value))
          // 若有回调函数，直接调用
          if (cb) {
            const tableData = instance.getRowData()
            cb({ parentParams: params, currentValue: value, tableData, rowData: tableData[id] })
          }
          // 强制刷新当前行
          forceRefreshRow(cloneData.id)
        }
        function customKeyDownEvent(event: KeyboardEvent) {
          if (event.code === 'Enter') {
            input.value!.blur()
          }
          if (['ArrowLeft', 'ArrowRight'].includes(event.code)) {
            event.stopPropagation()
          }
        }
        return () => (
          <div class="c-flex-ycenter">
            <el-input
              ref="custom-input"
              class="custom-input-number"
              placeholder="请输入"
              modelValue={modelValue.value}
              onInput={(value: string) => isNumber(value) && (modelValue.value = value)}
              onChange={(value: string) => updateCellData(value)}
              onKeydown={customKeyDownEvent}
              disabled={disabled}
              clearable
            />
            <span class="custom-suffix">{cloneData[suffixField]}</span>
          </div>
        )
      }
    })
  }

  // 获取新的 journalsDetailTableData，计算借贷发生总额（每次更新日记账明细时都要调用一次）
  interface CalculateTotalAmt {
    debitAmtTotal: number
    creditAmtTotal: number
  }
  function getNewJournalsDetailTableData(newJournalsDetailTableData: JournalsDetailRow[]) {
    const totalMap: Record<string, CalculateTotalAmt> = {}
    return newJournalsDetailTableData
      .sort((a, b) => Number(a.docEntry) - Number(b.docEntry))
      .map((i) => {
        if (!Reflect.has(totalMap, i.docEntry)) {
          const value = newJournalsDetailTableData.reduce(
            (pre, next) => {
              // 自动计算借贷发生总额
              if (next.docEntry === i.docEntry) {
                pre.debitAmtTotal += next.debitAmt
                pre.creditAmtTotal += next.creditAmt
              }
              return pre
            },
            { debitAmtTotal: 0, creditAmtTotal: 0 }
          )
          Reflect.set(totalMap, i.docEntry, value)
        }
        const { debitAmtTotal, creditAmtTotal } = totalMap[i.docEntry]
        return { ...i, debitAmtTotal, creditAmtTotal }
      })
  }

  // 更新基本信息的收款金额（关联单据选中时）
  function updateBaseInfoPayAmount(totalAmt: number) {
    const { baseInfoAgTable } = params!
    const { updateCellData, forceRefreshRow } = baseInfoAgTable.value!
    updateCellData({ id: 0, field: 'payAmount', value: totalAmt })
    forceRefreshRow(0)
  }

  // 更新基本信息（关联单据选中时）
  function updateBaseInfoPayAcctCode(args: AnyObject) {
    const { baseInfoAgTable } = params!
    const { updateRowData, forceRefreshRow, instance } = baseInfoAgTable.value!
    const rowData = instance.getRowData()
    updateRowData({ id: 0, value: { ...rowData[0], ...args } }) // 更新表格行数据
    forceRefreshRow(0) // 强制刷新行
  }

  // 日记账明细修改行
  function updateRowOfJournalsDetail(action: UpdateJournalsDetailActions) {
    const { journalsDetailAgTable, journalsDetailTableData } = params!
    // 获取表格的当前数据
    const journalDetailData = journalsDetailAgTable.value?.instance.getRowData() || []

    // 初始化更新数据
    let updatedData = journalDetailData

    switch (action.type) {
      case 'AccountCode': {
        updatedData = journalDetailData.map((item) => (item.code ? item : { ...item, ...action.data }))
        break
      }

      case 'Amt': {
        const { docEntry, currentValue } = action.data
        updatedData = journalDetailData.map((item) => {
          if (item.docEntry === docEntry && 'isCredit' in item) {
            return item.isCredit ? { ...item, creditAmt: Number(currentValue) } : { ...item, debitAmt: Number(currentValue) }
          }
          return item
        })
        break
      }

      default:
        console.warn(`Unhandled action type: ${action.type}`)
        break
    }
    // 更新表格数据
    journalsDetailTableData.value = getNewJournalsDetailTableData(updatedData)
  }

  // 日记账明细添加行（关联单据选中时）
  function addRowOfJournalsDetailByLinkOrder<T extends AnyObject>(selectedData: T[], orderField: keyof T) {
    const { journalsDetailAgTable, journalsDetailTableData, baseInfoAgTable } = params!
    let journalDetailData = journalsDetailAgTable.value!.instance.getRowData()
    const docEntrys = journalDetailData.flatMap((i) => (i.addType === 'addByLinkOrder' ? i.docEntry : []))
    const uniqDocEntrys = [...new Set(docEntrys)]
    const orderFields = selectedData.map((i) => i[orderField])
    const baseInfoRowData = baseInfoAgTable.value!.instance.getRowData()[0]
    const args = { code: baseInfoRowData.accountCode, name: baseInfoRowData.acctName }
    const willAddData = selectedData.flatMap((next) => {
      // 判断是否已经添加
      if (uniqDocEntrys.includes(next[orderField])) return []
      return (next.journalDetailResps || []).map((item: JournalsDetailRow) => ({
        ...item,
        addType: 'addByLinkOrder',
        checked: true,
        docType: next.docType,
        ...(item.code ? {} : args) // 如果没有 code，则补充 args
      }))
    })

    // 添加行
    if (willAddData.length > 0) {
      journalDetailData = [...journalDetailData, ...willAddData]
    }
    // 删除行
    if (uniqDocEntrys.length > orderFields.length) {
      journalDetailData = journalDetailData.filter((i) => {
        return orderFields.includes(i.docEntry) || i.addType === 'addByUser'
      })
    }
    journalsDetailTableData.value = getNewJournalsDetailTableData(journalDetailData)
  }

  // 提交
  function submitData() {
    // 停止编辑
    const { linkOrderAgTable, baseInfoAgTable, journalsDetailAgTable } = params!
    linkOrderAgTable.value!.gridApi.stopEditing()
    baseInfoAgTable.value!.gridApi.stopEditing()
    journalsDetailAgTable.value!.gridApi.stopEditing()
    // 获取提交所需的数据
    const { message, baseInfo, linkOrders, journalDetails } = getSubmitData()

    if (message) {
      ElMessage({ type: 'warning', message })
    } else {
      if (baseInfo && linkOrders && journalDetails) {
        const requestParams = { waterIds: waterIds.value, baseInfo, linkOrders, journalDetails }
        const Api = curComponent.value === CurComponentEnum.payMoney ? OutPaymentAddReconcliation : ReceiptReconcliation
        loading.value = true
        Api(requestParams)
          .then((res) => {
            if (res.code === 200) {
              ElMessage({ type: 'success', message: '操作成功' })
              params!.emit('updateLeftCard') // 左侧表格数据重新查询
            }
          })
          .finally(() => {
            loading.value = false
          })
      } else {
        ElMessage({ type: 'warning', message: '获取表格数据为空，操作失败' })
      }
    }
  }

  // 根据 key 获取到提交所需的数据
  function getSubmitData() {
    const { baseInfoAgTable, journalsDetailAgTable, linkOrderAgTable } = params!
    const linkOrderKeys =
      curComponent.value === 'payMoney'
        ? ['paymentDetailId', 'paymentNumber', 'currency', 'actualPay', 'ledgerAccount', 'docDate', 'docType']
        : ['docEntry', 'inAccountAmount', 'linkOrders', 'docType', 'docTotal', 'invoices']
    const baseInfoBaseKeys = ['accountCode', 'currency', 'rate', 'payAmount', 'memo', 'indicator', 'docDate']
    const baseInfoKeys = curComponent.value === 'payMoney' ? baseInfoBaseKeys : [...baseInfoBaseKeys, 'cardCode', 'cardName', 'slpCode']
    const journalsDetailKeys = ['docEntry', 'creditAmt', 'debitAmt', 'name', 'remark', 'code']
    const baseInfoData = baseInfoAgTable.value?.instance.getRowData() ?? []
    const journalsDetailData = journalsDetailAgTable.value?.instance.getRowData() ?? []
    const linkOrderSelectedData = linkOrderAgTable.value?.gridApi.getSelectedRows()
    const journalsDetailSelectedData = journalsDetailAgTable.value?.gridApi.getSelectedRows()
    const baseInfoMatchData = getMatchAttrs(baseInfoData, baseInfoKeys)[0]
    const linkOrderSelectedMatchData =
      curComponent.value === 'payMoney'
        ? getMatchAttrs(linkOrderSelectedData, linkOrderKeys)
        : getMatchAttrs(linkOrderSelectedData, linkOrderKeys).map((i) => {
            const newInvoices = i.invoices?.flatMap((i: AcceptMoneyChildLinkOrderRow) => {
              return i.checked ? { invoiceNo: i.invoiceNo, inAccountAmount: i.inAccountAmount } : []
            })
            return { ...i, invoices: newInvoices }
          })
    const journalsDetailSelectedMatchData = getMatchAttrs(journalsDetailSelectedData, journalsDetailKeys)
    const message = new Map([
      [!baseInfoData[0].accountCode, '银行科目不能为空'],
      [!baseInfoData[0].currency, '币种不能为空'],
      [!baseInfoData[0].rate, '汇率不能为空'],
      [!baseInfoData[0].payAmount, '付款金额不能为空'],
      [!baseInfoData[0].indicator, '标识不能为空'],
      [!baseInfoData[0].docDate, '过账日期不能为空'],
      [journalsDetailData.some((i) => !i.debitAmt && i.debitAmt !== 0), '借方发生额不能为空'],
      [journalsDetailData.some((i) => !i.creditAmt && i.creditAmt !== 0), '贷方发生额不能为空'],
      [new Set(linkOrderSelectedData?.map((i) => i.currency)).size > 1, '关联单据选中行币种不一致，操作失败'],
      [new Set(linkOrderSelectedData?.map((i) => i.cardCode)).size > 1, '关联单据只能选择同一个业务伙伴，操作失败']
    ]).get(true)
    return { message, linkOrders: linkOrderSelectedMatchData, baseInfo: baseInfoMatchData, journalDetails: journalsDetailSelectedMatchData }
  }

  // 根据 key 筛选对象属性
  function getMatchAttrs(data: AnyObject[] | undefined, keys: string[]) {
    return (
      data?.map((row) => {
        const entries = keys.map((key) => [key, row[key] ?? null])
        return Object.fromEntries(entries)
      }) ?? []
    )
  }

  // 排序查询
  const OrderTypeEnum: { [key: string]: number } = { docTotal: 1, dueAmount: 2 } // 1：根据单据金额排序；2：根据到期金额排序；（不传或传0，默认不排序）
  function serverSortHandler({ colId, sort }: AgSortParams) {
    const sortParams =
      curComponent.value === CurComponentEnum.payMoney
        ? {
            sortName: capitalizeFirstLetter(colId),
            sortOrder: sort
          }
        : {
            OrderType: OrderTypeEnum[colId] || 0,
            IsAsc: sort === 'asc'
          }

    // 更新查询列表
    Object.assign(queryList.value, sortParams)

    // 调用搜索函数
    params?.onSearch?.()
  }

  return {
    loading,
    selectData,
    modeMap,
    curComponent,
    activeNames,
    queryList,
    waterIds,
    waterTotalAmt,
    getNewestDate,
    customSuffixInputComp,
    getNewJournalsDetailTableData,
    submitData,
    updateBaseInfoPayAmount,
    addRowOfJournalsDetailByLinkOrder,
    updateRowOfJournalsDetail,
    updateBaseInfoPayAcctCode,
    serverSortHandler
  }
}
