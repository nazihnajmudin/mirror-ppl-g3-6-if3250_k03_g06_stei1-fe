'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { HotTable } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import { getTableConfig } from '../_config/tableConfigs';
import { useReportStore } from '../_store/useReportStore';

// Register all Handsontable modules
registerAllModules();

interface DataGridProps {
  sheetName: string;
}

const DataGrid: React.FC<DataGridProps> = ({ sheetName }) => {
  const hotRef = useRef<any>(null);
  const { data, updateSheetData } = useReportStore();
  const config = useMemo(() => getTableConfig(sheetName), [sheetName]);

  // Use stored data or a default row
  const currentData = useMemo(() => {
    return (data[sheetName] && data[sheetName].length > 0)
      ? data[sheetName]
      : [Array.from({ length: config.columns.length }, () => '')];
  }, [data, sheetName, config.columns.length]);

  useEffect(() => {
    console.log(`[DataGrid] Mounted/Updated for sheet: ${sheetName}`, {
      rowCount: currentData.length,
      colCount: config.columns.length,
      hasNestedHeaders: !!config.nestedHeaders
    });
  }, [sheetName, currentData.length, config.columns.length, config.nestedHeaders]);

  const handleAfterChange = (changes: any) => {
    if (changes && hotRef.current?.hotInstance) {
      const updatedData = hotRef.current.hotInstance.getData();
      console.log(`[DataGrid] Change detected in ${sheetName}`, { rows: updatedData.length });
      updateSheetData(sheetName, updatedData);
    }
  };

  const addRow = () => {
    if (hotRef.current?.hotInstance) {
      const instance = hotRef.current.hotInstance;
      instance.alter('insert_row_below');
      updateSheetData(sheetName, instance.getData());
    }
  };

  const removeRow = () => {
    if (hotRef.current?.hotInstance) {
      const instance = hotRef.current.hotInstance;
      if (instance.countRows() > 1) {
        instance.alter('remove_row');
        updateSheetData(sheetName, instance.getData());
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-2 border-2 border-red-100 rounded-lg">
      <div className="flex items-center justify-between mb-4 px-1 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{config.title}</h2>
          <p className="text-xs text-gray-400 font-mono">DEBUG: Sheet={sheetName} Rows={currentData.length} Cols={config.columns.length}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addRow}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Tambah Baris
          </button>
          <button
            onClick={removeRow}
            className="px-4 py-2 text-sm font-semibold bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            - Hapus Baris
          </button>
        </div>
      </div>
      
      <div className="relative border-2 border-blue-200 rounded-xl bg-white shadow-lg overflow-visible" style={{ minHeight: '650px', height: '650px' }}>
        <HotTable
          ref={hotRef}
          data={currentData}
          colHeaders={!config.nestedHeaders}
          rowHeaders={true}
          columns={config.columns}
          nestedHeaders={config.nestedHeaders}
          width="100%"
          height="100%"
          licenseKey="non-commercial-and-evaluation"
          afterChange={handleAfterChange}
          stretchH="all"
          contextMenu={true}
          manualColumnResize={true}
          manualRowResize={true}
          autoWrapRow={true}
          autoWrapCol={true}
          renderAllRows={true}
          selectionMode="multiple"
        />
      </div>
    </div>
  );
};

export default DataGrid;
