import { useTemplateRef } from 'vue'
import type { JournalsDetailRow, RightCardHookParams } from '@/views/finance/bankStatements/types'
import { ElMessage } from 'element-plus'
import { useGlobal } from './useGlobal'

export const useDialog = (params: RightCardHookParams) => {
  const { journalsDetailAgTable, baseInfoTableData, journalsDetailTableData } = params
  const { getNewJournalsDetailTableData, selectData } = useGlobal()
  const detailDialog = useTemplateRef<DialogInstance | null>('detailDialog')
  const getJournalsDetailTableData = () => {
    return journalsDetailAgTable.value!.instance.getRowData()
  }
  const openDetailDialog = () => {
    const tableData = getJournalsDetailTableData()
    const docEntryList = tableData.reduce((pre, next) => {
      if (next.docEntry && !pre.includes(next.docEntry)) {
        pre.push({ label: next.docEntry, value: next.docEntry, docType: next.docType })
      }
      return pre
    }, [])
    detailDialog.value?.openDialog({ docEntryList, selectData: selectData.value })
  }
  function addJournalsDetail(data: JournalsDetailRow[]) {
    const tableData = getJournalsDetailTableData()
    const { currency } = baseInfoTableData.value[0]
    if (currency) {
      const widdAddData = data.map((i) => ({ ...i, currency, addType: 'addByUser' }))
      journalsDetailTableData.value = getNewJournalsDetailTableData([...tableData, ...widdAddData])
    } else {
      ElMessage({ type: 'warning', message: '币种为空，添加失败' })
    }
  }
  function deleteJournalsDetail() {
    const tableData = getJournalsDetailTableData()
    const selectedData = journalsDetailAgTable.value?.gridApi.getSelectedRows() ?? []
    const newTableData = tableData.filter((i) => !selectedData.map((i) => i.id).includes(i.id))
    journalsDetailTableData.value = getNewJournalsDetailTableData(newTableData)
  }
  return { openDetailDialog, addJournalsDetail, deleteJournalsDetail }
}
