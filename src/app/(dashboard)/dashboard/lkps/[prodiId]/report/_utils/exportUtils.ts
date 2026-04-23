import ExcelJS from 'exceljs';
import { tableConfigs } from '../_config/tableConfigs';

/**
 * Exports data to Excel.
 * Optimization: If we only want to export the current view, it's much faster.
 * For now, we'll keep the multi-sheet logic but optimize the processing.
 */
export const exportToExcel = async (allData: Record<string, any[][]>, activeSheet?: string) => {
  try {
    console.log('[Export] Starting export process...');
    const response = await fetch('/template.xlsx');
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
        data.forEach((rowData, index) => {
          const rowNumber = config.startRow + index;
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
