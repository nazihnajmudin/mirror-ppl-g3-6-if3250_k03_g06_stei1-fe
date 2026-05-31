import ExcelJS from 'exceljs'
import { tableConfigs } from '../config/tableConfigs'

export const exportToExcel = async (allData: Record<string, any[][]>, activeSheet?: string) => {
  try {
    const response = await fetch('/template-lkps.xlsx')
    if (!response.ok) throw new Error('Template not found')
    
    const arrayBuffer = await response.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)

    const sheetsToProcess = activeSheet ? [activeSheet] : Object.keys(allData)
    sheetsToProcess.forEach((sheetName) => {
      const data = allData[sheetName]
      if (!data || data.length === 0) return

      const worksheet = workbook.getWorksheet(sheetName)
      const config = tableConfigs[sheetName]

      if (worksheet && config) {
        data.forEach((rowData, index) => {
          const rowNumber = config.startRow + index
          const row = worksheet.getRow(rowNumber)
          rowData.forEach((cellValue, colIndex) => {
            const colNumber = config.startCol + colIndex
            const cell = row.getCell(colNumber)
            
            if (cell.formula || (cell as any).sharedFormula || cell.type === ExcelJS.ValueType.Formula) {
              return
            }

            cell.value = cellValue === '' ? null : cellValue
          })
          row.commit()
        })
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `LKPS_Export_${new Date().toISOString().split('T')[0]}.xlsx`
    anchor.click()
    window.URL.revokeObjectURL(url)
    return true
  } catch (error) { throw error }
}