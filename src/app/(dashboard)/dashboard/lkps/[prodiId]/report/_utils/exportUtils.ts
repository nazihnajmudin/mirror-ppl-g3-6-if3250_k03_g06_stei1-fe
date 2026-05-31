import ExcelJS from 'exceljs';
import { tableConfigs } from '../_config/tableConfigs';

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

/**
 * Exports data to Excel.
 * Optimization: If we only want to export the current view, it's much faster.
 * For now, we'll keep the multi-sheet logic but optimize the processing.
 */
export const exportToExcel = async (allData: Record<string, any[][]>, activeSheet?: string) => {
  try {
    console.log('[Export] Starting export process...');
    const response = await fetch('/template-lkps.xlsx');
    if (!response.ok) throw new Error('Template not found');
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    console.log('[Export] Template loaded');

    // Only process sheets that have data in our store
    const sheetsToProcess = activeSheet ? [activeSheet] : Object.keys(allData);

    sheetsToProcess.forEach((sheetName) => {
      const data = allData[sheetName];
      if (!data || data.length === 0) return;

      const worksheet = workbook.getWorksheet(sheetName);
      const config = tableConfigs[sheetName];

      if (worksheet && config) {
        console.log(`[Export] Writing ${data.length} rows to sheet: ${sheetName}`);
        const dynamicStartRow = findDataStartRow(worksheet);
        
        data.forEach((rowData, index) => {
          const rowNumber = dynamicStartRow + index;
          const row = worksheet.getRow(rowNumber);
          
          rowData.forEach((cellValue, colIndex) => {
            const colNumber = config.startCol + colIndex;
            const cell = row.getCell(colNumber);
            cell.value = cellValue === '' ? null : cellValue;
          });
          row.commit();
        });
      }
    });

    console.log('[Export] Generating buffer...');
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `LKPS_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
    anchor.click();
    
    window.URL.revokeObjectURL(url);
    console.log('[Export] Done');
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};
