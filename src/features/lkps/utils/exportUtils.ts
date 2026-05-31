import ExcelJS from 'exceljs'
import { tableConfigs } from '../config/tableConfigs'

const extractCellValue = (cell: any): any => {
  let value = cell?.value;
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value;
  if (typeof value === 'object') {
    if ('result' in value) value = value.result;
    else if ('error' in value) return '';
    else if ('hyperlink' in value && 'text' in value) value = value.text;
    else if ('richText' in value) value = value.richText.map((rt: any) => rt.text).join('');
    else return '';
  }
  return value !== undefined && value !== null ? value : '';
};

const findDataStartRow = (worksheet: any, maxRows = 40): number => {
  for (let r = 1; r <= maxRows; r++) {
    const row = worksheet.getRow(r);
    const valA = String(extractCellValue(row.getCell(1))).trim();
    const valB = String(extractCellValue(row.getCell(2))).trim();
    if (valA === '1' || valB === '1') {
      return r; 
    }
  }
  return 10; 
};

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
        const dynamicStartRow = findDataStartRow(worksheet);
        const templateRow = worksheet.getRow(dynamicStartRow);
        const colCount = config.columns ? config.columns.length : 20; // safe fallback
        
        // 1. Write data and apply template style
        data.forEach((rowData, index) => {
          const rowNumber = dynamicStartRow + index;
          const row = worksheet.getRow(rowNumber);
          
          rowData.forEach((cellValue, colIndex) => {
            const colNumber = config.startCol + colIndex;
            const cell = row.getCell(colNumber);
            
            // Apply template style to ensure consistent font, borders, and background
            const templateCell = templateRow.getCell(colNumber);
            if (templateCell && templateCell.style) {
              // Note: Object.assign on style creates a shallow copy, sufficient for ExcelJS primitive style objects
              cell.style = Object.assign({}, templateCell.style);
            }
            
            if (cell.formula || (cell as any).sharedFormula || cell.type === ExcelJS.ValueType.Formula) {
              return;
            }

            cell.value = cellValue === '' ? null : cellValue;
          });
          row.commit();
        });
        
        // 2. Clear remaining pre-allocated empty template rows (if any)
        // Check up to 50 rows below the data to clear out leftover empty rows (like No. 2, 3, etc. that are unused)
        let currentRow = dynamicStartRow + data.length;
        let clearCount = 0;
        while (clearCount < 50) {
          const row = worksheet.getRow(currentRow);
          // Check if this row looks like a pre-allocated empty template row
          // Usually column A or B has a number, and the rest is empty
          const valA = String(extractCellValue(row.getCell(config.startCol))).trim();
          const valB = String(extractCellValue(row.getCell(config.startCol + 1))).trim();
          
          // If both A and B are empty, we might have reached the end of the table or a summary row
          if (!valA && !valB) break;
          
          // If it contains a formula, it's likely a summary row like "Jumlah", stop clearing
          const cellA = row.getCell(config.startCol);
          if (cellA.formula || (cellA as any).sharedFormula || cellA.type === ExcelJS.ValueType.Formula) {
            break;
          }
          
          // It looks like a leftover row, clear its values and styles so it doesn't look ugly
          for (let i = 0; i < colCount; i++) {
            const cell = row.getCell(config.startCol + i);
            if (!cell.formula && !(cell as any).sharedFormula && cell.type !== ExcelJS.ValueType.Formula) {
               cell.value = null;
               cell.style = {}; // Remove borders/background
            }
          }
          row.commit();
          currentRow++;
          clearCount++;
        }
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