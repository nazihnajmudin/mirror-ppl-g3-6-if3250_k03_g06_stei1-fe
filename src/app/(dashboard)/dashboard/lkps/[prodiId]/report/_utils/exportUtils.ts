import ExcelJS from 'exceljs';
import { TableConfig, tableConfigs } from '../_config/tableConfigs';

export const exportToExcel = async (allData: Record<string, any[][]>) => {
  try {
    const response = await fetch('/template.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    Object.entries(allData).forEach(([sheetName, data]) => {
      const worksheet = workbook.getWorksheet(sheetName);
      const config = tableConfigs[sheetName];

      if (worksheet && config) {
        // Clear existing data rows in the template if needed, 
        // or just overwrite starting from config.startRow
        data.forEach((rowData, index) => {
          const rowNumber = config.startRow + index;
          rowData.forEach((cellValue, colIndex) => {
            const colNumber = config.startCol + colIndex;
            const cell = worksheet.getCell(rowNumber, colNumber);
            cell.value = cellValue;
          });
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Laporan_Kinerja_Prodi_${new Date().getFullYear()}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
  }
};
