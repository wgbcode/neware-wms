import { computed, defineComponent, shallowRef, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { numberFormat, numberFormat2 } from '@/utils/format'
import type { BaseInfoRow, AcctList, RightCardHookParams, SaleManCompQuerySearch, CardCodeList } from '@/views/finance/bankStatements/types'
import { useSelectList } from '../common/useSelectList'
import { useGlobal } from './useGlobal'
import type { ValueFormatterParams } from 'ag-grid-community'
import { GetSlpInfo, GetCardCodeList } from '@/views/finance/bankStatements/request'

export const useBaseInfo = (params: RightCardHookParams) => {
  const { baseInfoAgTable } = params
  const { customSuffixInputComp, curComponent, loading, updateRowOfJournalsDetail } = useGlobal(params)
  const { getAcctList } = useSelectList()
  const acctList = shallowRef<AcctList[]>([])
  const cardCodeList = shallowRef<CardCodeList[]>([])
  const currencyList = shallowRef<SelectList[]>([])
  const indicatorList = shallowRef<SelectList[]>([])
  const canChangeCurrency = shallowRef<boolean>(false) // 是否可以选择币种

  // 银行科目
  const accountCodeComp = defineComponent({
    props: { params: { type: Object as AgParams<BaseInfoRow>, required: true } },
    setup(props) {
      const cloneData = { ...props.params.data! }
      const modelValue = shallowRef<string>(cloneData.accountCode!)
      const acctListItem = computed(() => acctList.value.find((i) => i.value === modelValue.value))
      function changeHandler(value: string) {
        modelValue.value = value // 更新选择框绑定值
        if (acctListItem.value) {
          const { currency, rate, canChangeCurr, indicator, acctCode, acctName } = acctListItem.value
          const { instance, updateRowData, forceRefreshRow } = baseInfoAgTable.value!
          // 拿到最新的表格数据
          const tableData = instance.getRowData()
          const newRate = Number(numberFormat2({ value: rate, min: 6, max: 6 }))
          if (rate) {
            // 同时更新币种和汇率
            const params = {
              id: cloneData.id,
              value: { ...tableData[0], accountCode: value, currency, rate: newRate, indicator, acctName }
            }
            canChangeCurrency.value = canChangeCurr! // 是否能继续选择币种
            updateRowData(params) // 更新表格行数据
            forceRefreshRow(cloneData.id!) // 强制刷新行
            updateRowOfJournalsDetail({ type: 'AccountCode', data: { code: acctCode, name: acctName } })
          } else {
            ElMessage({ type: 'warning', message: '汇率为空，请联系财务重新维护汇率' })
          }
        } else {
          ElMessage({ type: 'warning', message: '未找到匹配的银行科目' })
        }
      }
      return () => (
        <div class="c-flex-center" title={acctListItem.value?.label}>
          <el-select-v2
            popper-class="unique-dropdown" // 为下拉框添加唯一类名
            class="custom-select"
            modelValue={modelValue.value}
            options={acctList.value}
            placeholder="请选择"
            size="small"
            itemHeight={24}
            onChange={changeHandler}
          />
        </div>
      )
    }
  })
  const currencyComp = defineComponent({
    props: { params: { type: Object as AgParams<BaseInfoRow>, required: true } },
    setup(props) {
      const cloneData = { ...props.params.data! }
      const modelValue = shallowRef<string>(cloneData.currency)
      function changeHandler(value: string) {
        const { updateCellData } = baseInfoAgTable.value!
        const params = {
          id: cloneData.id,
          field: 'currency',
          value: value
        }
        modelValue.value = value // 更新选择框绑定值
        updateCellData(params) // 更新表格单元格数据
      }
      return () => (
        <div class="c-flex-ycenter">
          {canChangeCurrency.value ? (
            <el-select-v2
              class="custom-select"
              modelValue={modelValue.value}
              options={currencyList.value}
              placeholder="请选择"
              size="small"
              itemHeight={24}
              onChange={changeHandler}
            />
          ) : (
            <span>{modelValue.value}</span>
          )}
        </div>
      )
    }
  })
  const payAmountRMBComp = defineComponent({
    props: { params: { type: Object as AgParams<BaseInfoRow>, required: true } },
    setup(props) {
      const { payAmount, rate } = props.params.data!
      return () => (
        <div class="c-flex-xend">
          <span>{numberFormat(payAmount! * rate)}</span>
          <span class="custom-suffix">RMB</span>
        </div>
      )
    }
  })
  // 过账日期
  const dateComp = defineComponent({
    props: { params: { type: Object as AgParams<BaseInfoRow>, required: true } },
    setup(props) {
      const cloneData = { ...props.params.data! }
      const modelValue = shallowRef<string>(cloneData?.docDate || '')

      async function changeHandler(value: string) {
        if (modelValue.value !== value) {
          // 根据新日期，重新获取下拉列表和对应的汇率
          try {
            loading.value = true
            acctList.value = await getAcctList(value)
            const { instance, updateRowData, forceRefreshRow } = baseInfoAgTable.value!
            // 拿到最新的表格数据
            const tableData = instance.getRowData()
            const acctListItem = acctList.value.find((i) => i.value === tableData[0]?.accountCode)
            if (acctListItem) {
              const { rate, indicator } = acctListItem
              const message =
                new Map([
                  [!rate, '根据当前日期更新汇率失败，请联系财务人员处理'],
                  [!tableData[0]?.accountCode, '请先选择银行科目']
                ]).get(true) ?? ''
              if (message) {
                ElMessage({ type: 'warning', message })
              } else {
                // 同时更新汇率、收款金额、收款金额（本币）
                const params = {
                  id: cloneData.id,
                  value: { ...tableData[0], docDate: value, rate: Number(numberFormat2({ value: rate, min: 6, max: 6 })), indicator }
                }
                modelValue.value = value // 更新选择框绑定值
                updateRowData(params) // 更新表格行数据
                forceRefreshRow(cloneData.id!) // 强制刷新行
              }
            } else {
              ElMessage({ type: 'warning', message: '未找到匹配的银行科目' })
            }
          } finally {
            loading.value = false
          }
        }
      }
      return () => (
        <div class="c-flex-center">
          <el-date-picker
            class="custom-date-picker"
            modelValue={modelValue.value}
            type="date"
            placeholder="请选择"
            size="small"
            onUpdate:modelValue={changeHandler}
            format="YYYY.MM.DD"
            value-format="YYYY.MM.DD"
          />
        </div>
      )
    }
  })
  // 销售代表
  const saleManComp = defineComponent({
    props: { params: { type: Object as AgParams<BaseInfoRow>, required: true } },
    setup(props) {
      const cloneData = { ...props.params.data! }
      const modelValue = ref<string>(cloneData.slpName ?? '')

      async function querySearchAsync(queryString: string, cb: (data: SaleManCompQuerySearch[]) => void) {
        const res = await GetSlpInfo({ keyword: queryString })
        res.data = res.data.map((item: SaleManCompQuerySearch) => ({ value: item.slpName, ...item }))
        cb(res.data)
      }

      function handleSelect(item: SaleManCompQuerySearch) {
        const { instance, updateRowData } = baseInfoAgTable.value!
        const tableData = instance.getRowData()
        const params = {
          id: cloneData.id,
          value: { ...tableData[0], slpCode: item.slpCode, slpName: item.slpName }
        }
        updateRowData(params) // 更新表格行数据
      }

      return () => (
        <div class="c-flex-center">
          <el-autocomplete v-model={modelValue.value} fetch-suggestions={querySearchAsync} placeholder="请输入" onSelect={handleSelect} />
        </div>
      )
    }
  })
  // 业务伙伴代码下拉框
  const cardCodeComp = defineComponent({
    props: { params: { type: Object as AgParams<BaseInfoRow>, required: true } },
    setup(props) {
      const cloneData = { ...props.params.data! }
      const modelValue = shallowRef<string>(cloneData.cardCode || '')
      async function querySearchAsync(queryString: string, cb: (data: CardCodeList[]) => void) {
        if (queryString) {
          const res = await GetCardCodeList({ cardcode: queryString })
          res.data = res.data.map((item: AnyObject) => ({ value: item.cardCode, ...item }))
          cb(res.data)
        }
      }

      function handleSelect(item: CardCodeList) {
        const { instance, updateRowData } = baseInfoAgTable.value!
        const tableData = instance.getRowData()
        const params = {
          id: cloneData.id,
          value: { ...tableData[0], cardCode: item.cardCode, cardName: item.cardName }
        }
        updateRowData(params) // 更新表格行数据
      }

      return () => (
        <div class="c-flex-center">
          <el-autocomplete v-model={modelValue.value} fetch-suggestions={querySearchAsync} placeholder="请输入" onSelect={handleSelect} />
        </div>
      )
    }
  })

  const getBaseInfoRenderer = (field: string) => {
    const params = { field, suffixField: 'currency', getAgGridInstance: () => baseInfoAgTable.value }
    return customSuffixInputComp<BaseInfoRow>(params)
  }
  const baseInfoTableConfig: AgTableConfig = { forbidAutoSelectRowOnClick: true, forbidStriped: true }
  const baseInfoColumns = computed<AgColumnConfig[]>(() => {
    const cardCodeColumns =
      curComponent.value === 'acceptMoney'
        ? [
            { headerName: '业务伙伴代码', field: 'cardCode', width: 100, cellRenderer: cardCodeComp },
            { headerName: '业务伙伴名称', field: 'cardName', width: 120 },
            { headerName: '销售代表', field: 'slpCode', width: 100, cellRenderer: saleManComp } // 销售代码下拉框
          ]
        : []
    return [
      { headerName: '银行科目', field: 'accountCode', width: 160, cellRenderer: accountCodeComp }, // 修改时会影响到币种和汇率
      { headerName: '币种', field: 'currency', width: 60, cellRenderer: currencyComp }, // 是否能选择受银行科目下拉列表字段控制
      { headerName: '汇率', field: 'rate', width: 60, align: 'right' },
      { headerName: '付款金额', field: 'payAmount', width: 120, align: 'right', cellRenderer: getBaseInfoRenderer('payAmount') },
      // 付款金额（本币）为人民币，通过汇率和付款金额换算得到。同时，为了减小误差，前端只显示计算值，不回传后端，由后端自己计算
      { headerName: '付款金额（本币）', field: 'payAmountRMB', width: 120, align: 'right', cellRenderer: payAmountRMBComp },
      {
        headerName: '标识',
        field: 'indicator',
        width: 100,
        valueFormatter: (params: ValueFormatterParams) => {
          return indicatorList.value.find((i) => i.value === params.value)?.label ?? ''
        }
      },
      ...cardCodeColumns,
      { headerName: '过账日期', field: 'docDate', width: 110, cellRenderer: dateComp }, // 修改时会影响到汇率
      { headerName: '备注', field: 'memo', width: 130, editable: true, singleClickEdit: true }
    ]
  })
  return { baseInfoTableConfig, baseInfoColumns, canChangeCurrency, acctList, cardCodeList, currencyList, indicatorList }
}
