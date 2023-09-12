import type { TableConfig,ColumnsConfig } from './index.vue'
import { ref, type FunctionalComponent} from 'vue'
import { ElCheckbox,ElInput } from 'element-plus'
import type { CheckboxValueType, InputInstance } from 'element-plus'

let tableData:Record<string,any>[] | undefined

export const addVirTableDefaultConfig = (tableConfig: TableConfig | undefined) => {
  const config = (tableConfig ??= {})
  config.fixed ??= true
  return config
}

export const addVirColumnsDefaultConfig = (columnsConfig: ColumnsConfig, data:Record<string,any>[] | undefined) => {
  tableData = data
  return columnsConfig.map((config) => {
    switch(config.key){
      case 'selection':
        config.width ??= 35
        config.align ??= 'center'
        config.cellRenderer = selectionRender
        config.headerCellRenderer = headerSelectionRender
        break
      case 'index':
        config.title ??= '#'
        config.width ??= 35
        config.align ??= 'center'
        config.cellRenderer = ({ rowIndex }) => rowIndex + 1
        break
      case 'input':
        config.width ??= 140
        config.cellRenderer = inputRender
        break

    }
    return config
  })
}

// 复选框
type SelectionCellProps = {
  value: boolean
  intermediate?: boolean
  onChange: (_value: CheckboxValueType) => void
}
const SelectionCell: FunctionalComponent<SelectionCellProps> = ({
  value,
  intermediate = false,
  onChange,
}) => {
  return (
    <ElCheckbox
      onChange={onChange}
      modelValue={value}
      indeterminate={intermediate}
    />
  )
}
function selectionRender({ rowData }:Record<string,any>) {
  const onChange = (value: CheckboxValueType) => rowData.checked = value
  return <SelectionCell value={rowData.checked} onChange={onChange} />
}
function headerSelectionRender(){
  const onChange = (value: CheckboxValueType) =>
    (tableData = tableData?.map((row) => {
      row.checked = value
      return row
    }))
  const allSelected = tableData?.every((row) => row.checked) ?? false
  const containsChecked = tableData?.some((row) => row.checked)
  return (
    <SelectionCell
      value={allSelected}
      intermediate={containsChecked && !allSelected}
      onChange={onChange}
    />
  )
}

// input 
type InputCellProps = {
  value: string
  intermediate?: boolean
  onChange: (_value: string) => void
  onBlur?:() => void
  onKeydownEnter?:(_e: any) => void
  forwardRef?: (_el: InputInstance) => void
}
const InputCell:FunctionalComponent<InputCellProps> = ({value, onChange, forwardRef,onKeydownEnter}) => {
  return (
    <ElInput ref={forwardRef as any} onInput={onChange} modelValue={value} onKeydown={onKeydownEnter}/>
  )
}
function inputRender({rowData,column}:Record<string,any>){
  const onChange = (value: string) => rowData[column.datakey] = value
  const onEnterEditMode = () => rowData.editing = true
  const onExitEditMode = () => rowData.editing = false
  const onExitEditMode2 = (e: KeyboardEvent) => e.code === 'Enter' ? rowData.editing = false : ''
  const input = ref()
  const setRef = (el: InputInstance) => {
    input.value = el
    if (el) {
      el.focus?.()
    }
  }
  return rowData.editing ? (
    <InputCell 
    forwardRef={setRef} 
    value={rowData[column.datakey]} 
    onChange={onChange} 
    onBlur={onExitEditMode} 
    onKeydownEnter={onExitEditMode2}/>
  ) : (
    <div class="c-w100p c-h100p c-flex-ycenter" onClick={onEnterEditMode}>{rowData[column.datakey]}</div>
  )
}
