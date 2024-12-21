import { isRef, type Ref, type ShallowRef } from 'vue'
import XLSX, { type WorkSheet } from 'xlsx'

// 将 Excel 表格转译成 JSON 数据（异步)
const excelToJsonHandler = (rawFile: File | Blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    // 该事件在读取操作完成时触发
    reader.onload = (e: ProgressEvent<FileReader>) => {
      // 1. 获取解析到的数据
      const data = e.target?.result
      // 2. 利用 XLSX 对数据进行解析
      const workbook = XLSX.read(data, { type: 'array' })
      // 3. 获取第一张表格(工作簿)名称
      const firstSheetName = workbook.SheetNames[0]
      // 4. 只读取 Sheet1（第一张表格）的数据（也可循环读取多个 Sheet）
      const worksheet = workbook.Sheets[firstSheetName]
      // 5. 解析数据表头
      const header = getHeaderRow(worksheet)
      // 6. 解析数据体
      const results = XLSX.utils.sheet_to_json(worksheet)
      // 7. 传入解析之后的数据
      resolve({ header, results })
    }
    // 启动读取指定的 Blob 或 File 内容
    reader.readAsArrayBuffer(rawFile)
  })
}
// 获取表头（通用方式）
const getHeaderRow = (sheet: WorkSheet) => {
  const headers = []
  if (sheet['!ref']) {
    const range = XLSX.utils.decode_range(sheet['!ref'])
    let C
    const R = range.s.r
    for (C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
      let hdr = 'UNKNOWN ' + C
      if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
      headers.push(hdr)
    }
  }
  return headers
}

// 将表格数据格式转换成可导出 excel 表的数据格式
interface TransformParams {
  data: AnyObject[] // 表格数据
  columns: AnyObject[] // 表格列配置
  keyMap?: Record<string, string> // key 映射
  isNeedIndex?: boolean // 是否需要添加 index 列
}
const transformToExcelData = (params: TransformParams) => {
  const { data, columns, keyMap = { titleKey: 'headerName', propKey: 'field' }, isNeedIndex = false } = params
  const titleItem = columns.map((i) => i[keyMap.titleKey]).filter(Boolean)
  const propItem = columns.map((i) => i[keyMap.propKey]).filter(Boolean)
  const excelData = data.reduce<any[][]>(
    (pre, next) => {
      const dataItem: any[] = []
      propItem.forEach((prop) => {
        const value = next[prop] ?? null
        dataItem.push(value)
      })
      pre.push(dataItem)
      return pre
    },
    [titleItem]
  )
  isNeedIndex && addIndex(excelData)
  return excelData
}
function addIndex(excelData: any[][]) {
  excelData.forEach((item, index) => {
    if (index === 0) {
      item.splice(0, 0, '#')
    } else {
      item.splice(0, 0, index)
    }
  })
}

// 将 json 数据导出成 excel 表。workSheetData 表示二维数组，例如 [['S', 'h', 'e'], [1, 2, 3]]
const jsonToExcelHandler = (workSheetData: any[][], fileName = 'example.xlsx') => {
  const ws = XLSX.utils.aoa_to_sheet(workSheetData)
  const workSheetName = 'sheet'
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws, workSheetName)
  return XLSX.writeFile(workbook, fileName, { type: 'binary' })
}

// 将 DOM 导出成 excel 表
const domToExcelHandler = (el: HTMLElement | Ref | ShallowRef | AnyObject, fileName = 'example.xlsx') => {
  if (isRef(el)) {
    el = el.value?.$el ?? el.value?.getInstance()?.$el
  }
  if (!el) {
    throw new Error('没有获取到表格 DOM 元素')
  }
  const options = { raw: true }
  const workbook = XLSX.utils.table_to_book(el, options)
  return XLSX.writeFile(workbook, fileName, { type: 'binary' })
}

export { excelToJsonHandler, jsonToExcelHandler, domToExcelHandler, transformToExcelData }
